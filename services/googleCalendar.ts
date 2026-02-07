

// Este serviço gerencia a integração com a Google Calendar API
// NOTA: Em produção, você deve criar um Projeto no Google Cloud Console, 
// habilitar a Google Calendar API e criar um OAuth 2.0 Client ID.

// =================================================================================
// PARE AQUI: Você precisa gerar seu próprio Client ID no Google Cloud Console.
// 1. Acesse console.cloud.google.com
// 2. Crie credenciais OAuth para Aplicação Web.
// 3. Adicione a URL do seu site em "Origens JavaScript autorizadas".
// 4. Cole o ID abaixo.
// =================================================================================
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; 
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

declare var google: any;

let tokenClient: any;
let accessToken: string | null = localStorage.getItem('google_access_token');

export const initGoogleCalendar = () => {
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    // Só inicializa se o objeto google estiver disponível
    if (typeof google !== 'undefined' && google.accounts) {
      // @ts-ignore
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            accessToken = tokenResponse.access_token;
            localStorage.setItem('google_access_token', tokenResponse.access_token);
            // Dispara evento para atualizar UI
            window.dispatchEvent(new Event('google-auth-changed'));
          }
        },
      });
    }
  };
  document.body.appendChild(script);
};

export const signInToGoogle = () => {
  // Verificação de Segurança para evitar erro 400
  if (CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
    alert(
      'CONFIGURAÇÃO NECESSÁRIA:\n\n' +
      'O login do Google não funcionará porque o CLIENT_ID ainda é o de exemplo.\n\n' +
      '1. Crie um projeto no Google Cloud Console.\n' +
      '2. Gere um OAuth Client ID para Web.\n' +
      '3. Cole o ID no arquivo services/googleCalendar.ts.\n' +
      '4. Adicione a URL atual nas "Origens JavaScript autorizadas" no painel do Google.'
    );
    return;
  }

  if (tokenClient) {
    // Se o tokenClient existe, tenta logar. Se falhar, pode ser origem não autorizada.
    try {
      tokenClient.requestAccessToken();
    } catch (e) {
      alert("Erro ao iniciar popup. Verifique se as 'Origens Autorizadas' no Google Console correspondem à URL deste site.");
    }
  } else {
    alert("O serviço do Google ainda está carregando. Aguarde alguns segundos e tente novamente.");
  }
};

export const signOutFromGoogle = () => {
  const token = localStorage.getItem('google_access_token');
  if (token) {
    // @ts-ignore
    if(typeof google !== 'undefined' && google.accounts) {
        // @ts-ignore
        google.accounts.oauth2.revoke(token, () => {});
    }
    localStorage.removeItem('google_access_token');
    accessToken = null;
    window.dispatchEvent(new Event('google-auth-changed'));
  }
};

export const isGoogleConnected = () => {
  return !!localStorage.getItem('google_access_token');
};

export const listUpcomingEvents = async () => {
  if (!accessToken) return [];

  const now = new Date().toISOString();
  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=10&singleEvents=true&orderBy=startTime`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (response.status === 401) {
      signOutFromGoogle(); // Token expirado
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Erro ao buscar eventos", error);
    return [];
  }
};

export const createCalendarEvent = async (event: { summary: string, location: string, description: string, start: string, end: string }) => {
  if (!accessToken) throw new Error("Não autenticado");

  const eventBody = {
    summary: event.summary,
    location: event.location,
    description: event.description,
    start: {
      dateTime: event.start,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: event.end,
      timeZone: 'America/Sao_Paulo',
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventBody),
  });

  if (!response.ok) {
    throw new Error('Falha ao criar evento');
  }

  return await response.json();
};

import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProposalContent = async (topic: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere uma descrição profissional e uma lista de itens inclusos para uma proposta comercial de SSMA sobre: ${topic}. 
    Responda em formato JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          includedItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "description", "includedItems"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const refineLegalText = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Refine o seguinte texto para uma linguagem jurídica mais profissional e clara em um contrato de prestação de serviços: "${text}". Retorne apenas o texto refinado.`,
    config: {
        systemInstruction: "Você é um advogado especialista em contratos de prestação de serviços de tecnologia e eventos."
    }
  });
  return response.text;
};

export const suggestNextStep = async (leadName: string, company: string, status: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `O lead ${leadName} da empresa ${company} está na fase de ${status} para serviços de SSMA. Sugira em uma frase curta e persuasiva qual deve ser o próximo passo técnico ou comercial imediato para acelerar o fechamento.`,
    config: {
        systemInstruction: "Você é um mestre em vendas consultivas B2B de engenharia e segurança do trabalho (SSMA)."
    }
  });
  return response.text;
};

export const getMarketPricing = async (serviceName: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Pesquise o preço médio de mercado no Brasil para o serviço de SSMA: ${serviceName}. Retorne um resumo dos valores e links relevantes.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web).filter(Boolean) || []
  };
};

export const analyzeFinances = async (data: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analise estes dados financeiros de uma empresa de consultoria e sugira 3 ações estratégicas imediatas: ${data}.`,
    config: {
        systemInstruction: "Você é um CFO virtual especializado em rentabilidade de empresas de serviços de engenharia."
    }
  });
  return response.text;
};

export const fetchServicesFromWeb = async (url: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Pesquise no site ${url} e na web quais são os serviços oferecidos pela SSA360. 
    Extraia o nome do serviço e a categoria (Treinamento, Consultoria, Auditoria). 
    Estime um preço médio de mercado (R$) e um custo operacional sugerido. 
    Retorne um array JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING },
            price: { type: Type.NUMBER },
            cost: { type: Type.NUMBER }
          },
          required: ["name", "type", "price", "cost"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const extractFinancialDataFromDocument = async (base64Data: string, mimeType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        {
          text: `Analise este documento (extrato bancário, nota fiscal ou recibo). 
          Identifique todas as transações financeiras listadas.
          Para cada transação, extraia:
          - description: Descrição curta do que é.
          - value: Valor numérico (positivo).
          - type: "Entrada" se for crédito/recebimento, "Saída" se for débito/pagamento.
          - date: Data no formato YYYY-MM-DD.
          - category: Uma categoria sugerida (ex: Alimentação, Transporte, Vendas, Impostos, Outros).
          
          Retorne um array JSON estrito.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            value: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ["Entrada", "Saída"] },
            date: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["description", "value", "type", "date", "category"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

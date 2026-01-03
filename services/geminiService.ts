
import { GoogleGenAI } from "@google/genai";
import { Product, SalesData, Category, School, OperatingUnit } from '../types';

// Función segura para obtener la API Key sin romper el hilo de ejecución del navegador
const getApiKey = () => {
  try {
    // @ts-ignore - En Vercel/Vite se inyecta como process.env.API_KEY o import.meta.env.VITE_API_KEY
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const getAI = () => {
  const apiKey = getApiKey();
  return new GoogleGenAI({ apiKey });
};

export const getSalesAnalysis = async (salesData: SalesData[]): Promise<string> => {
  try {
    const ai = getAI();
    const dataSummary = salesData.map(d => `${d.name}: $${d.revenue} revenue, ${d.orders} orders`).join('\n');
    const prompt = `Como analista de negocios de MeCard Network, analiza estas ventas semanales:\n${dataSummary}\n\nDa 3 consejos para aumentar ventas. Máximo 80 palabras. Usa emojis.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Análisis no disponible.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al analizar datos.";
  }
};

export const getPlatformStrategicAudit = async (
  schools: School[], 
  units: OperatingUnit[]
): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `Actúa como un CTO de FinTech. 
    Red actual: ${schools.length} colegios, ${units.length} terminales. 
    Volumen: $${schools.reduce((a, b) => a + b.balance, 0)}.
    Analiza riesgos de seguridad y dame una recomendación audaz para el roadmap técnico de los próximos 6 meses.
    Sé conciso y directo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 2000 } }
    });
    
    return response.text || "Auditoría no disponible.";
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    return "Error de análisis AI.";
  }
};

export const getNutritionalInsights = async (product: Product): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `Resumen nutricional divertido para un estudiante sobre: ${product.name}. Calorías: ${product.calories || 'N/A'}. Máximo 50 palabras.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "¡Delicioso y nutritivo!";
  } catch (error) {
    return "Info nutricional no disponible.";
  }
};

export const getHealthyAlternatives = async (blockedCategory: Category, availableProducts: Product[]): Promise<string> => {
  try {
    const ai = getAI();
    const productsList = availableProducts.filter(p => p.isAvailable).map(p => p.name).join(', ');
    const prompt = `El alumno no puede comprar ${blockedCategory}. De esta lista: ${productsList}, sugiere una alternativa saludable. Máximo 15 palabras.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Prueba una opción natural.";
  } catch (error) {
    return "Sugerencia: Elige algo más ligero hoy.";
  }
};

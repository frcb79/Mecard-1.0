
import { GoogleGenAI } from "@google/genai";
import { Product, SalesData, Category, School, OperatingUnit, CartItem } from '../types';

// Use process.env.API_KEY exclusively as per Google GenAI guidelines
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getSalesAnalysis = async (salesData: SalesData[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const dataSummary = salesData.map(d => `${d.name}: $${d.revenue} revenue, ${d.orders} orders`).join('\n');
    const prompt = `Como analista de negocios de MeCard Network, analiza estas ventas semanales:\n${dataSummary}\n\nDa 3 consejos para aumentar ventas. Máximo 80 palabras. Usa emojis.`;
    
    // Using gemini-3-flash-preview for basic text tasks
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

export const getSmartUpsell = async (cart: CartItem[], allProducts: Product[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const cartItems = cart.map(i => i.name).join(', ');
    const available = allProducts.slice(0, 10).map(p => p.name).join(', ');
    const prompt = `Cart has: ${cartItems}. Suggestions from: ${available}. Suggest ONE complementary item for a school student to add. Max 10 words.`;
    
    // Using gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Prueba algo nuevo.";
  } catch (e) {
    return "Sugerencia: ¡Un snack saludable!";
  }
};

export const getPlatformStrategicAudit = async (
  schools: School[], 
  units: OperatingUnit[]
): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `Actúa como un CTO de FinTech de MeCard Network. 
    Red actual: ${schools.length} colegios, ${units.length} terminales. 
    Volumen: $${schools.reduce((a, b) => a + b.balance, 0)}.
    Analiza riesgos de seguridad y dame una recomendación audaz para el roadmap técnico de los próximos 6 meses.
    Sé conciso y directo.`;

    // Using gemini-3-pro-preview for complex reasoning and audit tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    
    return response.text || "Auditoría no disponible.";
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    if (error instanceof Error && error.message.includes("not found")) {
        throw new Error("KEY_NOT_FOUND");
    }
    return "Error de análisis AI.";
  }
};

export const getNutritionalInsights = async (product: Product): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `Resumen nutricional divertido para un estudiante sobre: ${product.name}. Calorías: ${product.calories || 'N/A'}. Máximo 50 palabras.`;
    // Using gemini-3-flash-preview for basic text tasks
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
    const ai = getAIClient();
    const productsList = availableProducts.filter(p => p.isAvailable).map(p => p.name).join(', ');
    const prompt = `El alumno no puede comprar ${blockedCategory}. De esta lista: ${productsList}, sugiere una alternativa saludable. Máximo 15 palabras.`;
    // Using gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Prueba una opción natural.";
  } catch (error) {
    return "Sugerencia: Elige algo más ligero hoy.";
  }
};

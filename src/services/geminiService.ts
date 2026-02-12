
import { GoogleGenAI } from "@google/genai";
import { Product, SalesData, Category, School, OperatingUnit, CartItem } from '../types';

// Use import.meta.env.VITE_GEMINI_API_KEY for Vite environment variables
const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ VITE_GEMINI_API_KEY not configured. Gemini features will use fallback messages.');
  }
  return new GoogleGenAI({ apiKey: apiKey || 'placeholder-key' });
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

// ============================================
// NEW: Parent & Student AI Features
// ============================================

export const getSpendingAnalysis = async (
  spendingHistory: any[],
  restrictions: string[],
  monthlyBudget: number
): Promise<string> => {
  try {
    const ai = getAIClient();
    const totalSpent = spendingHistory.reduce((sum, tx) => sum + tx.amount, 0);
    const avgTransaction = spendingHistory.length > 0 ? totalSpent / spendingHistory.length : 0;
    const topCategories = spendingHistory
      .slice(0, 5)
      .map(tx => tx.category)
      .join(', ');

    const prompt = `Actúa como asesor financiero para padres.
    Hijo ha gastado: $${totalSpent.toFixed(2)} este mes
    Promedio por transacción: $${avgTransaction.toFixed(2)}
    Top categorías: ${topCategories}
    Presupuesto mensual: $${monthlyBudget}
    
    Analiza patrones y da 3 recomendaciones prácticas para optimizar gasto.
    Máximo 100 palabras. Usa emojis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Análisis de gasto no disponible.";
  } catch (error) {
    console.error("Spending Analysis Error:", error);
    return "💡 Sugerencia: Revisa los gastos de tu hijo esta semana.";
  }
};

export const getSmartAlerts = async (
  studentBalance: number,
  dailyLimit: number,
  spentToday: number,
  recentTransactions: any[]
): Promise<string[]> => {
  try {
    const ai = getAIClient();
    const percentageSpent = (spentToday / dailyLimit) * 100;
    const avgDailySpend = recentTransactions.length > 0 
      ? recentTransactions.reduce((sum, tx) => sum + tx.amount, 0) / Math.max(recentTransactions.length, 1)
      : 0;

    const alerts: string[] = [];

    // Alert 1: Budget threshold
    const alert1Prompt = `Saldo: $${studentBalance}, Límite diario: $${dailyLimit}, Gastado hoy: $${spentToday} (${percentageSpent.toFixed(0)}%).
    Si el % es >75%, genera una alerta ROJA urgente. Si es 50-75%, alerta AMARILLA educativa.
    Si es <50%, solo emojis positivos. Máximo 15 palabras. No incluyas números exactos.`;

    const alert1 = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: alert1Prompt,
    });
    if (alert1.text) alerts.push(alert1.text);

    // Alert 2: Pattern detection
    if (recentTransactions.length >= 3) {
      const alert2Prompt = `Últimas 3 compras de mi hijo: ${recentTransactions
        .slice(0, 3)
        .map(tx => `${tx.category}: $${tx.amount}`)
        .join(', ')}.
      Detecta patrón de consumo y da una observación breve (máx 15 palabras).`;

      const alert2 = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: alert2Prompt,
      });
      if (alert2.text) alerts.push(alert2.text);
    }

    return alerts.length > 0 ? alerts : ["✅ Todo va bien. ¡Sigue así!"];
  } catch (error) {
    console.error("Smart Alerts Error:", error);
    return ["⚠️ Revisa el saldo de tu hijo."];
  }
};

export const getHealthChallenges = async (
  studentAge: number,
  dietaryRestrictions: string[],
  lastPurchases: Product[]
): Promise<string> => {
  try {
    const ai = getAIClient();
    const recentItems = lastPurchases.slice(0, 5).map(p => p.name).join(', ');
    
    const prompt = `Eres un coach nutricional gamificado para un estudiante de ${studentAge} años.
    Compras recientes: ${recentItems}
    Restricciones: ${dietaryRestrictions.join(', ') || 'ninguna'}
    
    Crea UN reto divertido y alcanzable para hoy (máx 20 palabras). 
    Debe ser motivador. Incluye emojis. Ejemplo: "🥦 Reto: Prueba 1 verde hoy y desbloquea badge"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "🎯 Reto diario: ¡Haz una compra saludable!";
  } catch (error) {
    console.error("Health Challenge Error:", error);
    return "🎮 Reto: Prueba algo nuevo hoy 🌟";
  }
};

export const getFinancialEducation = async (
  studentAge: number,
  spendingCategory: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const prompt = `Eres un profesor de finanzas para un estudiante de ~${studentAge} años.
    Hoy compró algo en: ${spendingCategory}
    
    Enseña UNA lección corta sobre dinero/presupuesto relacionada (máx 50 palabras).
    Usa un tono casual y amigable. Empieza con "¿Sabías que...?" Incluye emojis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "💰 Aprende: Cada peso que gastas hoy, es dinero que no tendrás mañana.";
  } catch (error) {
    console.error("Financial Education Error:", error);
    return "📚 Consejo: Presupuesta tus gastos como un profesional.";
  }
};

export const getNutritionalRecommendations = async (
  menuItems: string[],
  nutritionInfo: any[],
  dietaryPreference: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const itemsList = menuItems.join(', ');
    const prompt = `Eres un nutricionista escolar asesorando a estudiantes sobre opciones del menú.
    Menú disponible hoy: ${itemsList}
    Preferencia dietaria: ${dietaryPreference || 'equilibrada'}
    
    Recomienda las 2-3 MEJORES opciones para una comida saludable y balanceada.
    Explica brevemente por qué. Máximo 70 palabras. Usa emojis. Sé motivador/a.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "🥗 Elige el Pollo con Arroz y acompaña con la Ensalada Mixta para un balance perfecto.";
  } catch (error) {
    console.error("Nutritional Recommendations Error:", error);
    return "💚 Recomendación: Elige opciones que combinen proteína, carbohidratos y vegetales.";
  }
};

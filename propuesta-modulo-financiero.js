/**
 * Propuesta de implementación para el Módulo de Educación y Gestión Financiera
 *
 * Este archivo esboza la estructura de datos y la lógica de negocio necesaria
 * para soportar las funcionalidades de ahorro, bloqueo de fondos, marketplace
 * y educación financiera.
 */

// ---------------------------------------------------------
// 1. Modelos de Datos Sugeridos (Esquemas Conceptuales)
// ---------------------------------------------------------

const FinancialProfileSchema = {
    studentId: "ObjectId", // Referencia al usuario alumno
    wallet: {
        availableBalance: Number, // Dinero líquido disponible para uso inmediato
        lockedBalance: Number,    // Dinero apartado/bloqueado en metas de ahorro
        points: Number            // Puntos acumulados para el marketplace
    },
    // Metas de ahorro o "Apartados"
    savingsGoals: [{
        id: String,
        name: String,             // Ej: "Para la bicicleta", "Fondo de emergencia"
        targetAmount: Number,     // Meta a alcanzar
        currentAmount: Number,    // Monto ahorrado actualmente
        isLocked: Boolean,        // Si el dinero está bloqueado
        releaseDate: Date,        // Fecha en la que el dinero se desbloquea automáticamente
        status: "active" | "completed" | "cancelled"
    }]
};

const MarketplaceItemSchema = {
    id: String,
    name: String,
    description: String,
    priceInPoints: Number,    // Costo en puntos
    stock: Number,
    category: "gift" | "digital_asset" | "school_supply"
};

// ---------------------------------------------------------
// 2. Lógica de Negocio (Servicios)
// ---------------------------------------------------------

class FinancialService {
    
    // Métodos auxiliares para la simulación (Mocks de Base de Datos)
    async getProfile(studentId) {
        // Simulación: Si no existe en memoria, crea un perfil por defecto
        if (!this._mockDb) this._mockDb = {};
        if (!this._mockDb[studentId]) {
            this._mockDb[studentId] = {
                studentId,
                wallet: { availableBalance: 1000, lockedBalance: 0, points: 50 },
                savingsGoals: []
            };
        }
        return this._mockDb[studentId];
    }

    async getItem(itemId) {
        return { id: itemId, name: "Tarjeta Regalo", description: "Vale por $10", priceInPoints: 100, stock: 10, category: "gift" };
    }

    // Funcionalidad: Apartar o Bloquear dinero
    // Permite al alumno mover dinero de su saldo disponible a un "apartado" bloqueado
    async createSavingsGoal(studentId, name, amount, lockUntilDate) {
        const profile = await this.getProfile(studentId); // (Simulado) Obtener perfil de BD
        const profile = await this.getProfile(studentId);
        
        if (profile.wallet.availableBalance < amount) {
            throw new Error("Fondos insuficientes en el saldo disponible para apartar esta cantidad.");
        }

        // Mover de disponible a bloqueado
        profile.wallet.availableBalance -= amount;
        profile.wallet.lockedBalance += amount;

        profile.savingsGoals.push({
            id: Date.now().toString(), // ID simple para el ejemplo
            name,
            targetAmount: amount,
            currentAmount: amount,
            isLocked: true,
            releaseDate: lockUntilDate,
            status: "active"
        });

        // Aquí guardarías los cambios en la base de datos
        return profile;
    }

    // Funcionalidad: Canjear dinero por puntos (Gamificación)
    // Incentiva el ahorro permitiendo convertir excedentes en puntos para regalos
    async exchangeMoneyForPoints(studentId, amount) {
        const EXCHANGE_RATE = 10; // Ejemplo: 1 unidad de moneda = 10 puntos
        const profile = await this.getProfile(studentId);

        if (profile.wallet.availableBalance < amount) {
            throw new Error("Fondos insuficientes para realizar el canje.");
        }

        profile.wallet.availableBalance -= amount;
        profile.wallet.points += (amount * EXCHANGE_RATE);

        return profile;
    }

    // Funcionalidad: Comprar en Marketplace
    async purchaseItem(studentId, itemId) {
        const profile = await this.getProfile(studentId);
        const item = await this.getItem(itemId); // (Simulado) Obtener item de BD
        const item = await this.getItem(itemId);

        if (profile.wallet.points < item.priceInPoints) {
            throw new Error("Puntos insuficientes para este regalo.");
        }

        if (item.stock <= 0) {
            throw new Error("Este artículo está agotado.");
        }

        profile.wallet.points -= item.priceInPoints;
        item.stock--;

        return { success: true, remainingPoints: profile.wallet.points, item };
    }

    // Funcionalidad: Procesar compra en POS (Esquema de Puntos e Incentivos)
    // Aumenta el precio base para cubrir el costo de los puntos (premios) y dar una comisión al POS.
    async processPosPurchase(studentId, posId, basePrice) {
        // Configuración del esquema de negocio
        const MARKUP_PERCENTAGE = 0.15; // Incremento del 15% sobre el precio base para cubrir premios
        const POS_INCENTIVE_PERCENTAGE = 0.20; // El POS recibe el 20% de ese incremento como incentivo
        const POINTS_RATE = 1; // 1 punto por cada unidad de moneda del precio final

        // Cálculo de montos
        const finalPrice = basePrice * (1 + MARKUP_PERCENTAGE);
        const profitMargin = finalPrice - basePrice;
        const posCommission = profitMargin * POS_INCENTIVE_PERCENTAGE;
        // const platformRevenue = profitMargin - posCommission; // Parte para cubrir los premios del marketplace
        const pointsToAward = Math.floor(finalPrice * POINTS_RATE);

        const profile = await this.getProfile(studentId);

        if (profile.wallet.availableBalance < finalPrice) {
            throw new Error("Saldo insuficiente para realizar la compra en el POS.");
        }

        // Ejecución de la transacción
        profile.wallet.availableBalance -= finalPrice;
        profile.wallet.points += pointsToAward;

        // Aquí se guardaría el registro de la transacción y se asignaría la comisión al POS
        // await this.transactionRepo.save({ ... });

        return {
            success: true,
            paidAmount: finalPrice,
            pointsEarned: pointsToAward,
            posCommissionEarned: posCommission,
            remainingBalance: profile.wallet.availableBalance
        };
    }

    // Funcionalidad: Educación Financiera con IA (Gemini)
    // Genera consejos personalizados basados en el historial de gastos y ahorro del alumno.
    async getAiFinancialTips(studentId) {
        const profile = await this.getProfile(studentId);
        
        // Simulación de integración con Gemini
        // En producción: const prompt = `Analiza este perfil financiero: ${JSON.stringify(profile)} y da 3 consejos.`;
        // const tips = await geminiApi.generateContent(prompt);

        return [
            "🤖 Gemini Tip: He notado que has cumplido tu meta de ahorro mensual. ¡Felicidades! Considera aumentar tu meta un 5% el próximo mes.",
            "🤖 Gemini Tip: Tus gastos en el POS han aumentado. Si reduces una compra a la semana, podrías canjear ese premio que quieres en 2 semanas.",
            "🤖 Gemini Tip: Recuerda que los puntos acumulados son dinero virtual. ¡Úsalos sabiamente en el marketplace!"
        ];
    }
}

// ---------------------------------------------------------
// 3. Script de Visualización / Prueba (Simulación)
// ---------------------------------------------------------
// Este bloque permite ejecutar el archivo con `node propuesta-modulo-financiero.js`
// para ver la lógica en acción en la consola.

(async () => {
    // Solo ejecutar si este archivo es el principal (no si es importado)
    if (require.main === module) {
        console.log("🚀 Iniciando simulación del Módulo Financiero...\n");
        
        const service = new FinancialService();
        const studentId = "alumno_prueba_1";

        try {
            // 1. Estado Inicial
            let profile = await service.getProfile(studentId);
            console.log(`💰 Saldo Inicial: $${profile.wallet.availableBalance} | Puntos: ${profile.wallet.points}`);

            // 2. Crear Ahorro
            console.log("\n--- Creando meta de ahorro: 'Bicicleta' ($200) ---");
            await service.createSavingsGoal(studentId, "Bicicleta", 200, new Date("2024-12-31"));
            console.log(`✅ Meta creada. Nuevo saldo disponible: $${profile.wallet.availableBalance}`);
            console.log(`🔒 Saldo bloqueado: $${profile.wallet.lockedBalance}`);

            // 3. Compra en POS (genera puntos)
            console.log("\n--- Realizando compra en POS ($100 base + recargos) ---");
            const posResult = await service.processPosPurchase(studentId, "pos_cafeteria", 100);
            console.log(`🛒 Compra exitosa. Total pagado: $${posResult.paidAmount}`);
            console.log(`⭐ Puntos ganados: ${posResult.pointsEarned}`);
            console.log(`💰 Saldo restante: $${posResult.remainingBalance}`);

            // 4. Consejos IA
            console.log("\n--- Consejos Financieros IA ---");
            const tips = await service.getAiFinancialTips(studentId);
            tips.forEach(t => console.log(t));

        } catch (error) {
            console.error("❌ Error en la simulación:", error.message);
        }
        console.log("\n🏁 Fin de la simulación.");
    }
})();

module.exports = { FinancialService, FinancialProfileSchema };

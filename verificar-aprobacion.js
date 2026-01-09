const readline = require('readline');

// Obtener el entorno actual, por defecto 'development' si no está definido
const entorno = process.env.NODE_ENV || 'development';

// Definir qué entornos requieren una pausa para aprobación manual
const entornosProtegidos = ['production', 'prod', 'test', 'testing', 'prueba'];

// Si el entorno actual no está en la lista de protegidos, salimos con éxito (0) inmediatamente
if (!entornosProtegidos.includes(entorno)) {
    process.exit(0);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`\n🛑 ALERTA DE SEGURIDAD: Estás intentando realizar cambios en el entorno: [ ${entorno.toUpperCase()} ]`);
console.log('Por política, se requiere aprobación explícita antes de continuar.');

rl.question('¿Confirmas que tienes la aprobación para proceder? (escribe "si" para continuar): ', (respuesta) => {
    rl.close();
    if (respuesta.trim().toLowerCase() === 'si') {
        console.log('✅ Aprobación confirmada. Ejecutando cambios...\n');
        process.exit(0);
    } else {
        console.error('❌ Operación cancelada por el usuario o falta de aprobación.\n');
        process.exit(1);
    }
});
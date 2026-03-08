Prompt de Rediseño: MeCard Elite Interface (Fintech Edition)

Contexto:
MeCard es una plataforma Fintech Escolar de alto nivel. El diseño actual es funcional, pero necesita elevarse a una estética de "Nivel 1: Enterprise/SaaS Premium" (estilo Stripe, Mercury, Revolut o Apple Business). Queremos eliminar la apariencia genérica de IA y sustituirla por un diseño de autor, tecnológico y extremadamente fino.

1. Dirección Estética (The "North Star")

Actúa como un Lead Product Designer con experiencia en sistemas financieros de alto tráfico. Sigue estos principios:

Tipografía Suiza Moderna: Utiliza 'Inter' o 'Geist'. Juega con contrastes extremos de peso: font-black para títulos principales e indicadores de dinero, y font-medium o font-regular para el cuerpo. El tracking (espaciado entre letras) en los títulos debe ser negativo (tracking-tighter).

Minimalismo Funcional (Bento Grid): Organiza la información en celdas claras con bordes sutiles (border-slate-100/50). No uses sombras pesadas; usa bordes de 1px y sombras de "oclusión ambiental" (muy suaves y difusas).

Paleta de Color "Sophisticated Tech": * Fondo: #F8FAFC (fresco) o Blanco puro.

Acentos: Indigo profundo (#4F46E5), Esmeralda para éxito y Slate para textos secundarios.

Evita los degradados de arcoíris. Usa degradados de un solo tono o transparencias sutiles.

Micro-detalles de Calidad:

rounded-[32px] o rounded-[48px] para contenedores grandes.

rounded-xl para elementos pequeños.

Uso consistente de backdrop-blur en modales y sidebars.

2. Instrucciones para Perfiles de Colegio y Super Admin

Para el Super Admin (Consola de Control Global):

Densidad de Información Inteligente: El administrador necesita ver muchos datos sin sentirse abrumado. Usa tablas con mucho padding vertical, tipografía pequeña pero en negrita para los headers, e indicadores de estado tipo "píldora" (pills).

Sensación de Seguridad: Incorpora elementos visuales que denoten robustez: iconos de escudos sutiles, estados de "Sincronizado" y nomenclaturas técnicas (como los 18 dígitos de la CLABE) destacados en fuentes monoespaciadas (font-mono).

Para el Administrador de Colegio (Operativo):

Enfoque en Flujo de Caja: El dinero debe ser el protagonista. Usa números grandes, con una jerarquía clara entre ingresos brutos, comisiones y neto.

Dashboard Ejecutivo: Menos es más. En lugar de 10 gráficas pequeñas, usa 3 grandes áreas de enfoque que cuenten una historia sobre la salud financiera del colegio.

3. Lo que DEBES EVITAR (Anti-Patterns de IA):

NO uses sombras shadow-lg o shadow-2xl genéricas. Usa sombras personalizadas muy ligeras.

NO uses bordes negros puros. Usa border-slate-100.

NO rellenes espacios vacíos con iconos innecesarios. El espacio en blanco es un lujo, úsalo.

NO uses colores saturados al 100%. Busca tonos ligeramente más "deslavados" o elegantes (Muted colors).

4. Estructura de Componentes Requerida:

Cards: Deben parecer piezas físicas de hardware, con un borde interior sutil (ring-1 ring-inset ring-slate-100).

Botones: Estado de reposo elegante, estado hover con una elevación mínima y cambio de color suave (transition-all duration-300).

Inputs: Minimalistas, fondo grisáceo muy tenue, sin bordes marcados hasta que reciban el focus.

Instrucción Final: Aplica estos principios a cada archivo que generes. Si el código no parece una aplicación de $1,000 millones de dólares en términos de UI, sigue iterando hasta lograr esa finura tecnológica.
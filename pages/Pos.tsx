import { usePos } from "../hooks/usePos";
import React from "react";
import "./Pos.css";

const Pos: React.FC = () => {
  const {
  student,
  cartItems,
  total,
  canPay,
} = usePos();
  return (
    <div className="pos-container">
      {/* Header */}
      <header className="pos-header">
        <div>🏫 Escuela: Demo School</div>
        <div>💰 Caja: Principal</div>
        <div>👤 Cajero: Admin</div>
      </header>

      {/* Main Content */}
      <main className="pos-main">
        {/* Left column: Student */}
        <section className="pos-student">
          <h2>Estudiante</h2>
          <div className="placeholder">
            Escanear QR / Buscar estudiante
          </div>
        </section>

        {/* Right column: Cart */}
        <section className="pos-cart">
          <h2>Carrito</h2>
          <div className="placeholder">
            No hay productos aún
          </div>
          <div className="pos-total">
            Total: ${total.toFixed(2)}
          </div>
          <button
  className="pos-pay-button"
  disabled={!canPay}
>
  COBRAR
</button>

        </section>
      </main>

      {/* Products */}
      <section className="pos-products">
        <h2>Productos</h2>
        <div className="placeholder">
          Grid de productos aquí
        </div>
      </section>
    </div>
  );
};

export default Pos;


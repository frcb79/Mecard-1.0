type Props = {
  onEnterAdmin: () => void;
};

export default function Home({ onEnterAdmin }: Props) {
  return (
    <div style={{ padding: 40 }}>
      <h1>Plataforma Escolar</h1>
      <p>Pantalla inicial</p>

      <button onClick={onEnterAdmin}>
        Entrar al Panel de Administración
      </button>
    </div>
  );
}

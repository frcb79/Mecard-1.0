import { useParams } from "react-router-dom";

export default function SchoolDetail() {
  const { id } = useParams();

  return (
    <div style={{ padding: 40 }}>
      <h1>Detalle de la escuela</h1>
      <p>ID de la escuela:</p>
      <strong>{id}</strong>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

interface Soutenance {
  id: number;
  etudiant: string;
  sujet: string;
  date: string;
  heure: string;
  salle: string;
}

export default function PlanningDashboard() {
  const [plannings, setPlannings] = useState<Soutenance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPlanning = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/planning');
      if (response.ok) {
        const data = await response.json();
        setPlannings(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du planning:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanning();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Gestion des Soutenances (EMIT)</h1>
      <button 
        onClick={fetchPlanning}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Chargement...' : 'Actualiser le planning'}
      </button>

      <div className="mt-4 border-t pt-4">
        {plannings.length === 0 ? (
          <p className="text-gray-500">Aucune soutenance planifiée pour le moment.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {plannings.map((item) => (
              <li key={item.id} className="py-2 flex justify-between">
                <span><strong>{item.etudiant}</strong> - {item.sujet}</span>
                <span className="text-sm text-gray-600">{item.date} à {item.heure} ({item.salle})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
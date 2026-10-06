import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, Trash2, Plus, AlertCircle, CheckCircle, Shield, BookOpen, Search } from 'lucide-react';

// Configuration de la base URL d'Axios (Ajuster si votre backend Laravel tourne sur un autre port)
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default function AffectationJurysPage() {
  const [soutenanceId, setSoutenanceId] = useState('1'); // ID de soutenance par défaut pour le test
  const [soutenance, setSoutenance] = useState(null);
  const [affectations, setAffectations] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulaire local
  const [selectedEnseignant, setSelectedEnseignant] = useState('');
  const [selectedRole, setSelectedRole] = useState('president');

  // Messages de retour
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Charger les données de la soutenance
  const fetchSoutenanceData = async (id) => {
    if (!id) return;
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.get(`/soutenances/${id}/jurys`);
      const { soutenance, affectations, enseignants } = response.data;

      setSoutenance(soutenance);
      setAffectations(affectations || []);
      setEnseignants(enseignants || []);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.message || 'Impossible de charger les données de la soutenance.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoutenanceData(soutenanceId);
  }, [soutenanceId]);

  // Ajouter un membre au jury
  const handleAddJuryMember = async (e) => {
    e.preventDefault();
    if (!selectedEnseignant) {
      setErrorMessage('Veuillez sélectionner un enseignant.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.post(`/soutenances/${soutenanceId}/jurys`, {
        enseignant_id: selectedEnseignant,
        role: selectedRole,
      });

      setSuccessMessage(response.data.message || 'Membre ajouté au jury avec succès !');
      
      // Recharger les affectations
      fetchSoutenanceData(soutenanceId);
      setSelectedEnseignant('');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Une erreur est survenue lors de l\'affectation.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un membre du jury
  const handleDeleteJuryMember = async (affectationId) => {
    if (!window.confirm('Voulez-vous vraiment retirer cet enseignant du jury ?')) return;

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.delete(`/affectations-jury/${affectationId}`);
      setSuccessMessage('Enseignant retiré du jury.');
      fetchSoutenanceData(soutenanceId);
    } catch (error) {
      console.error(error);
      setErrorMessage('Erreur lors de la suppression du membre du jury.');
    }
  };

  // Libellés lisibles pour les rôles
  const roleLabels = {
    president: 'Président',
    rapporteur: 'Rapporteur',
    examinateur: 'Examinateur',
  };

  const roleBadges = {
    president: 'bg-purple-100 text-purple-800 border-purple-300',
    rapporteur: 'bg-blue-100 text-blue-800 border-blue-300',
    examinateur: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-indigo-600" />
            Affectation des Jurys de Soutenance
          </h1>
          <p className="text-sm text-gray-500">
            Gérez la composition du jury pour chaque soutenance programmée.
          </p>
        </div>

        {/* Sélection de la soutenance à tester */}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border">
          <Search className="w-4 h-4 text-gray-400" />
          <label className="text-xs font-semibold text-gray-600">Soutenance ID :</label>
          <input
            type="number"
            value={soutenanceId}
            onChange={(e) => setSoutenanceId(e.target.value)}
            className="w-16 px-2 py-1 text-sm border rounded text-center font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Notifications d'erreur / succès */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Chargement de la soutenance...</div>
      ) : (
        <>
          {/* Fiche d'information de la Soutenance */}
          {soutenance && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-700">
                  Soutenance #{soutenance.id}
                </span>
                <span className="text-xs text-gray-400">
                  {soutenance.date_debut ? new Date(soutenance.date_debut).toLocaleString('fr-FR') : 'Créneau non défini'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-500" />
                Thème : {soutenance.theme || 'Non renseigné'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 pt-2 border-t">
                <div>
                  <strong>Étudiant :</strong> {soutenance.etudiant?.name} ({soutenance.etudiant?.email})
                </div>
                <div>
                  <strong>Salle :</strong> {soutenance.salle?.name || 'Non attribuée'}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulaire d'affectation */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Ajouter un Membre du Jury
              </h3>

              <form onSubmit={handleAddJuryMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Enseignant</label>
                  <select
                    value={selectedEnseignant}
                    onChange={(e) => setSelectedEnseignant(e.target.value)}
                    className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Sélectionner un enseignant --</option>
                    {enseignants.map((ens) => (
                      <option key={ens.id} value={ens.id}>
                        {ens.name} ({ens.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rôle dans le jury</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="president">Président</option>
                    <option value="rapporteur">Rapporteur</option>
                    <option value="examinateur">Examinateur</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  {submitting ? 'Affectation...' : 'Attribuer le Rôle'}
                </button>
              </form>
            </div>

            {/* Liste du Jury actuel */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">
                Membres du Jury Affectés ({affectations.length}/3)
              </h3>

              {affectations.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-6 text-center">
                  Aucun enseignant n'a encore été affecté à cette soutenance.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {affectations.map((aff) => (
                    <div key={aff.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                            roleBadges[aff.role] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {roleLabels[aff.role] || aff.role}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {aff.enseignant?.name || `Enseignant ID #${aff.enseignant_id}`}
                          </p>
                          <p className="text-xs text-gray-500">{aff.enseignant?.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteJuryMember(aff.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                        title="Retirer du jury"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
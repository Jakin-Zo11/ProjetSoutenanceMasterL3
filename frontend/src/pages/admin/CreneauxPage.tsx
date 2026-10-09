import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Layers,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react';
import { creneauxApi, type Creneau, type CreneauPayload, type CreneauType } from '../../services/api/creneaux';

const PERIOD = {
  range: '15 juin – 31 juillet 2025',
  start: '15 juin 2025',
  end: '31 juillet 2025',
  workingDays: 35,
  maxPerDay: 4,
};

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const JOURS_COURTS: Record<string, string> = {
  Lundi: 'Lun',
  Mardi: 'Mar',
  Mercredi: 'Mer',
  Jeudi: 'Jeu',
  Vendredi: 'Ven',
  Samedi: 'Sam',
};
const TYPE_OPTIONS: CreneauType[] = ['Matin', 'Après-midi'];

type FormState = {
  reference: string;
  heure_debut: string;
  heure_fin: string;
  jours: string[];
  type: CreneauType;
  capacite: string;
  actif: boolean;
};

type FormErrors = Partial<Record<'reference' | 'heure_debut' | 'heure_fin' | 'jours' | 'type' | 'capacite', string>> & {
  overlap?: string;
};

const emptyForm: FormState = {
  reference: '',
  heure_debut: '08:00',
  heure_fin: '10:00',
  jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
  type: 'Matin',
  capacite: '4',
  actif: true,
};

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatJours = (jours: string[]) => {
  const sorted = JOURS.filter((day) => jours.includes(day));
  if (sorted.length === 5 && sorted[0] === 'Lundi' && sorted[4] === 'Vendredi') return 'Lun–Ven';
  if (sorted.length === 6) return 'Lun–Sam';
  return sorted.map((day) => JOURS_COURTS[day]).join(', ');
};

const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-[#E1EDFB] text-[#1A4BA8]' : 'bg-[#E8EEF7] text-[#0D1F4E]'}`}>
    {active ? 'Actif' : 'Inactif'}
  </span>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-xs font-medium text-[#B42318]">{message}</p> : null;

const CreneauxPage: React.FC = () => {
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const reload = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setCreneaux(await creneauxApi.list());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger les créneaux.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    creneauxApi
      .list()
      .then((data) => {
        if (active) {
          setCreneaux(data);
          setLoadError('');
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : 'Impossible de charger les créneaux.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
        setEditingId(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isModalOpen]);

  const sortedCreneaux = useMemo(
    () => [...creneaux].sort((first, second) => toMinutes(first.heure_debut) - toMinutes(second.heure_debut)),
    [creneaux],
  );

  const activeCount = creneaux.filter((creneau) => creneau.actif).length;
  const inactiveCount = creneaux.length - activeCount;
  const capaciteTotale = creneaux
    .filter((creneau) => creneau.actif)
    .reduce((total, creneau) => total + creneau.capacite, 0);

  const errors = useMemo<FormErrors>(() => {
    const next: FormErrors = {};
    const reference = form.reference.trim();
    if (!reference) {
      next.reference = 'La référence est obligatoire.';
    } else if (creneaux.some((creneau) => creneau.id !== editingId && creneau.reference.toLowerCase() === reference.toLowerCase())) {
      next.reference = 'Cette référence existe déjà.';
    }
    if (!form.heure_debut) next.heure_debut = 'L’heure de début est obligatoire.';
    if (!form.heure_fin) next.heure_fin = 'L’heure de fin est obligatoire.';
    if (form.heure_debut && form.heure_fin && toMinutes(form.heure_fin) <= toMinutes(form.heure_debut)) {
      next.heure_fin = 'L’heure de fin doit être postérieure à l’heure de début.';
    }
    if (form.jours.length === 0) next.jours = 'Sélectionnez au moins un jour.';
    if (!form.type) next.type = 'Sélectionnez un type.';
    const capacite = Number(form.capacite);
    if (!form.capacite.trim() || !Number.isInteger(capacite) || capacite <= 0) {
      next.capacite = 'Saisissez un nombre entier positif.';
    }
    if (form.heure_debut && form.heure_fin && form.jours.length) {
      const overlap = creneaux.find((creneau) =>
        creneau.id !== editingId
        && creneau.jours.some((day) => form.jours.includes(day))
        && toMinutes(form.heure_debut) < toMinutes(creneau.heure_fin)
        && toMinutes(form.heure_fin) > toMinutes(creneau.heure_debut));
      if (overlap) next.overlap = `Chevauchement détecté avec le créneau ${overlap.reference}.`;
    }
    return next;
  }, [form, creneaux, editingId]);

  const isValid = Object.keys(errors).length === 0;
  const showError = (field: keyof FormErrors) => (submitted || touched[field] ? errors[field] : undefined);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setTouched({});
    setSubmitted(false);
    setApiError('');
    setIsModalOpen(true);
  };

  const openEdit = (creneau: Creneau) => {
    setForm({
      reference: creneau.reference,
      heure_debut: creneau.heure_debut,
      heure_fin: creneau.heure_fin,
      jours: [...creneau.jours],
      type: creneau.type,
      capacite: String(creneau.capacite),
      actif: creneau.actif,
    });
    setEditingId(creneau.id);
    setTouched({});
    setSubmitted(false);
    setApiError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingId(null);
  };

  const toggleJour = (jour: string) => {
    setTouched((current) => ({ ...current, jours: true }));
    setForm((current) => ({
      ...current,
      jours: current.jours.includes(jour)
        ? current.jours.filter((day) => day !== jour)
        : [...current.jours, jour],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    const payload: CreneauPayload = {
      reference: form.reference.trim(),
      heure_debut: form.heure_debut,
      heure_fin: form.heure_fin,
      jours: [...form.jours].sort((first, second) => JOURS.indexOf(first) - JOURS.indexOf(second)),
      type: form.type,
      capacite: Number(form.capacite),
      actif: form.actif,
    };
    setSaving(true);
    setApiError('');
    try {
      if (editingId !== null) {
        const updated = await creneauxApi.update(editingId, payload);
        setCreneaux((current) => current.map((creneau) => (creneau.id === updated.id ? updated : creneau)));
        setFeedback(`Créneau ${updated.reference} mis à jour.`);
      } else {
        const created = await creneauxApi.create(payload);
        setCreneaux((current) => [...current, created]);
        setFeedback(`Créneau ${created.reference} créé avec succès.`);
      }
      setIsModalOpen(false);
      setEditingId(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'L’enregistrement du créneau a échoué.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActif = async (creneau: Creneau) => {
    setOpenMenuId(null);
    try {
      const updated = await creneauxApi.updateStatut(creneau.id, !creneau.actif);
      setCreneaux((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      setFeedback(`Créneau ${updated.reference} ${updated.actif ? 'activé' : 'désactivé'}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'La mise à jour du statut a échoué.');
    }
  };

  const removeCreneau = async (creneau: Creneau) => {
    setOpenMenuId(null);
    if ((creneau.soutenances_count ?? 0) > 0) {
      setFeedback(`Suppression impossible : le créneau ${creneau.reference} est associé à une soutenance.`);
      return;
    }
    if (!window.confirm(`Confirmer la suppression du créneau ${creneau.reference} ?`)) return;
    try {
      await creneauxApi.remove(creneau.id);
      setCreneaux((current) => current.filter((entry) => entry.id !== creneau.id));
      setFeedback(`Créneau ${creneau.reference} supprimé.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'La suppression a échoué.');
    }
  };

  const renderActions = (creneau: Creneau) => {
    const associated = (creneau.soutenances_count ?? 0) > 0;
    return (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => openEdit(creneau)}
          aria-label={`Modifier le créneau ${creneau.reference}`}
          title="Modifier"
          className="rounded-lg p-2 text-[#1A4BA8] transition-colors hover:bg-[#EAF1FB]"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          onClick={() => void toggleActif(creneau)}
          aria-label={`${creneau.actif ? 'Désactiver' : 'Activer'} le créneau ${creneau.reference}`}
          title={creneau.actif ? 'Désactiver' : 'Activer'}
          className="rounded-lg p-2 text-[#2D84E0] transition-colors hover:bg-[#EAF1FB]"
        >
          {creneau.actif ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
        <button
          type="button"
          onClick={() => void removeCreneau(creneau)}
          disabled={associated}
          aria-label={`Supprimer le créneau ${creneau.reference}`}
          title={associated ? 'Créneau associé à une soutenance' : 'Supprimer'}
          className={`rounded-lg p-2 transition-colors ${associated ? 'cursor-not-allowed text-[#B9C6DB]' : 'text-[#2D84E0] hover:bg-[#EAF1FB]'}`}
        >
          <Trash2 size={16} />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenuId((current) => (current === creneau.id ? null : creneau.id))}
            aria-label={`Plus d’actions pour le créneau ${creneau.reference}`}
            aria-expanded={openMenuId === creneau.id}
            title="Plus d’actions"
            className="rounded-lg p-2 text-[#637799] transition-colors hover:bg-[#EAF1FB]"
          >
            <MoreHorizontal size={16} />
          </button>
          {openMenuId === creneau.id && (
            <div className="absolute right-0 z-30 mt-1 w-48 rounded-lg border border-[#DDEAF7] bg-white p-1 shadow-lg">
              <button type="button" onClick={() => { setOpenMenuId(null); openEdit(creneau); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#0B1D3A] hover:bg-[#F0F5FB]">
                <Pencil size={14} /> Modifier
              </button>
              <button type="button" onClick={() => void toggleActif(creneau)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#0B1D3A] hover:bg-[#F0F5FB]">
                {creneau.actif ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                {creneau.actif ? 'Désactiver' : 'Activer'}
              </button>
              <button type="button" onClick={() => void removeCreneau(creneau)} disabled={associated} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#0B1D3A] hover:bg-[#F0F5FB] disabled:cursor-not-allowed disabled:text-[#B9C6DB]">
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-[#0B1D3A]">Créneaux horaires</h1>
        <p className="mt-1 text-sm text-[#637799]">Période : {PERIOD.range}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#DDEAF7] bg-white p-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-[#2D84E0]" size={20} aria-hidden="true" />
            <h2 className="font-bold text-[#0B1D3A]">Période de soutenance</h2>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#637799]">Début de session</dt>
              <dd className="font-bold text-[#0B1D3A]">{PERIOD.start}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#637799]">Fin de session</dt>
              <dd className="font-bold text-[#0B1D3A]">{PERIOD.end}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#637799]">Jours ouvrés</dt>
              <dd className="font-bold text-[#0B1D3A]">{PERIOD.workingDays} jours</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#637799]">Soutenances par jour maximum</dt>
              <dd className="font-bold text-[#0B1D3A]">{PERIOD.maxPerDay}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-[#DDEAF7] bg-white p-5">
          <div className="flex items-center gap-2">
            <Layers className="text-[#2D84E0]" size={20} aria-hidden="true" />
            <h2 className="font-bold text-[#0B1D3A]">Résumé</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-[#637799]">
                <CheckCircle2 className="text-[#1A4BA8]" size={18} aria-hidden="true" /> Créneaux actifs
              </span>
              <span className="font-bold text-[#0B1D3A]">{activeCount}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-[#637799]">
                <ToggleLeft className="text-[#2D84E0]" size={18} aria-hidden="true" /> Créneaux inactifs
              </span>
              <span className="font-bold text-[#0B1D3A]">{inactiveCount}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-[#637799]">
                <Layers className="text-[#1A4BA8]" size={18} aria-hidden="true" /> Capacité totale
              </span>
              <span className="font-bold text-[#0B1D3A]">{capaciteTotale} soutenances</span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[#DDEAF7] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#0B1D3A]">Créneaux définis</h2>
            <p className="mt-1 text-sm text-[#637799]">{creneaux.length} créneau(x) configuré(s)</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1A4BA8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0D1F4E]"
          >
            <Plus size={18} aria-hidden="true" /> Ajouter un créneau
          </button>
        </div>

        {feedback && (
          <p role="status" className="mt-4 rounded-lg border border-[#DDEAF7] bg-[#F0F5FB] p-3 text-sm text-[#1A4BA8]">
            {feedback}
          </p>
        )}

        {loadError && (
          <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-3 text-sm text-[#B42318]">
            <span>{loadError}</span>
            <button type="button" onClick={() => void reload()} className="inline-flex items-center gap-2 rounded-lg border border-[#1A4BA8] px-3 py-1.5 font-semibold text-[#1A4BA8]">
              <RefreshCw size={14} aria-hidden="true" /> Réessayer
            </button>
          </div>
        )}

        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#F0F5FB] text-xs uppercase tracking-wide text-[#637799]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Référence</th>
                <th scope="col" className="px-4 py-3 font-semibold">Heure de début</th>
                <th scope="col" className="px-4 py-3 font-semibold">Heure de fin</th>
                <th scope="col" className="px-4 py-3 font-semibold">Jours</th>
                <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDEAF7]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#637799]">Chargement des créneaux...</td>
                </tr>
              ) : sortedCreneaux.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#637799]">Aucun créneau défini pour le moment.</td>
                </tr>
              ) : sortedCreneaux.map((creneau) => (
                <tr key={creneau.id} className="transition-colors hover:bg-[#F0F5FB]">
                  <td className="px-4 py-3 font-mono font-semibold text-[#0B1D3A]">{creneau.reference}</td>
                  <td className="px-4 py-3 font-mono text-[#0B1D3A]">{creneau.heure_debut}</td>
                  <td className="px-4 py-3 font-mono text-[#0B1D3A]">{creneau.heure_fin}</td>
                  <td className="px-4 py-3 text-[#637799]">{formatJours(creneau.jours)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-[#F0F5FB] px-3 py-1 text-xs font-semibold text-[#637799]">{creneau.type}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge active={creneau.actif} /></td>
                  <td className="px-4 py-3">{renderActions(creneau)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-3 md:hidden">
          {loading ? (
            <p className="py-6 text-center text-sm text-[#637799]">Chargement des créneaux...</p>
          ) : sortedCreneaux.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#637799]">Aucun créneau défini pour le moment.</p>
          ) : sortedCreneaux.map((creneau) => (
            <article key={creneau.id} className="rounded-xl border border-[#DDEAF7] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono font-semibold text-[#0B1D3A]">{creneau.reference}</span>
                <StatusBadge active={creneau.actif} />
              </div>
              <div className="mt-3 space-y-1 text-sm text-[#637799]">
                <p className="font-mono text-[#0B1D3A]">{creneau.heure_debut} – {creneau.heure_fin}</p>
                <p>{formatJours(creneau.jours)} · {creneau.type}</p>
                <p>Capacité : {creneau.capacite} soutenance(s)</p>
              </div>
              <div className="mt-3 border-t border-[#DDEAF7] pt-2">{renderActions(creneau)}</div>
            </article>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1F4E]/40 p-4" role="presentation" onClick={closeModal}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="creneau-modal-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#DDEAF7] bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id="creneau-modal-title" className="text-lg font-bold text-[#0B1D3A]">
                {editingId !== null ? `Modifier le créneau ${form.reference}` : 'Ajouter un créneau'}
              </h2>
              <button type="button" onClick={closeModal} aria-label="Fermer" className="rounded-lg p-2 text-[#637799] hover:bg-[#F0F5FB]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
              <label className="text-sm font-medium text-[#0B1D3A] sm:col-span-2">
                Référence du créneau
                <input
                  autoFocus
                  value={form.reference}
                  onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))}
                  onBlur={() => setTouched((current) => ({ ...current, reference: true }))}
                  placeholder="CR-05"
                  aria-invalid={Boolean(showError('reference'))}
                  className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3 font-mono outline-none focus:border-[#2D84E0]"
                />
                <FieldError message={showError('reference')} />
              </label>
              <label className="text-sm font-medium text-[#0B1D3A]">
                Heure de début
                <span className="mt-1 flex items-center gap-2 rounded-lg border border-[#DDEAF7] p-3 focus-within:border-[#2D84E0]">
                  <Clock size={16} className="text-[#2D84E0]" aria-hidden="true" />
                  <input
                    type="time"
                    value={form.heure_debut}
                    onChange={(event) => setForm((current) => ({ ...current, heure_debut: event.target.value }))}
                    onBlur={() => setTouched((current) => ({ ...current, heure_debut: true }))}
                    aria-invalid={Boolean(showError('heure_debut'))}
                    className="w-full bg-transparent font-mono outline-none"
                  />
                </span>
                <FieldError message={showError('heure_debut')} />
              </label>
              <label className="text-sm font-medium text-[#0B1D3A]">
                Heure de fin
                <span className="mt-1 flex items-center gap-2 rounded-lg border border-[#DDEAF7] p-3 focus-within:border-[#2D84E0]">
                  <Clock size={16} className="text-[#2D84E0]" aria-hidden="true" />
                  <input
                    type="time"
                    value={form.heure_fin}
                    onChange={(event) => setForm((current) => ({ ...current, heure_fin: event.target.value }))}
                    onBlur={() => setTouched((current) => ({ ...current, heure_fin: true }))}
                    aria-invalid={Boolean(showError('heure_fin'))}
                    className="w-full bg-transparent font-mono outline-none"
                  />
                </span>
                <FieldError message={showError('heure_fin')} />
              </label>

              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium text-[#0B1D3A]">Jours disponibles</legend>
                <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {JOURS.map((jour) => (
                    <label key={jour} className="flex items-center gap-2 rounded-lg border border-[#DDEAF7] px-3 py-2 text-sm text-[#0B1D3A]">
                      <input
                        type="checkbox"
                        checked={form.jours.includes(jour)}
                        onChange={() => toggleJour(jour)}
                        className="h-4 w-4 rounded border-[#DDEAF7] text-[#1A4BA8] focus:ring-[#2D84E0]"
                      />
                      {jour}
                    </label>
                  ))}
                </div>
                <FieldError message={showError('jours')} />
              </fieldset>

              <label className="text-sm font-medium text-[#0B1D3A]">
                Type
                <select
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as CreneauType }))}
                  onBlur={() => setTouched((current) => ({ ...current, type: true }))}
                  aria-invalid={Boolean(showError('type'))}
                  className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3 outline-none focus:border-[#2D84E0]"
                >
                  {TYPE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <FieldError message={showError('type')} />
              </label>

              <label className="text-sm font-medium text-[#0B1D3A]">
                Nombre maximum de soutenances
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={form.capacite}
                  onChange={(event) => setForm((current) => ({ ...current, capacite: event.target.value }))}
                  onBlur={() => setTouched((current) => ({ ...current, capacite: true }))}
                  aria-invalid={Boolean(showError('capacite'))}
                  className="mt-1 w-full rounded-lg border border-[#DDEAF7] p-3 font-mono outline-none focus:border-[#2D84E0]"
                />
                <FieldError message={showError('capacite')} />
              </label>

              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium text-[#0B1D3A]">Statut</legend>
                <div className="mt-1 flex gap-2">
                  {[{ label: 'Actif', value: true }, { label: 'Inactif', value: false }].map((option) => (
                    <label key={option.label} className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${form.actif === option.value ? 'border-[#2D84E0] text-[#1A4BA8]' : 'border-[#DDEAF7] text-[#637799]'}`}>
                      <input
                        type="radio"
                        name="statut"
                        checked={form.actif === option.value}
                        onChange={() => setForm((current) => ({ ...current, actif: option.value }))}
                        className="h-4 w-4 border-[#DDEAF7] text-[#1A4BA8] focus:ring-[#2D84E0]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {errors.overlap && (
                <p role="alert" className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-3 text-sm text-[#B42318] sm:col-span-2">
                  {errors.overlap}
                </p>
              )}
              {apiError && (
                <p role="alert" className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-3 text-sm text-[#B42318] sm:col-span-2">
                  {apiError}
                </p>
              )}

              <div className="flex justify-end gap-3 sm:col-span-2">
                <button type="button" onClick={closeModal} className="rounded-lg border border-[#DDEAF7] px-4 py-2 font-semibold text-[#637799] hover:bg-[#F0F5FB]">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!isValid || saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1A4BA8] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#0D1F4E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} aria-hidden="true" />
                  {saving ? 'Enregistrement...' : 'Enregistrer le créneau'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {openMenuId !== null && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpenMenuId(null)}
          className="fixed inset-0 z-20 cursor-default"
        />
      )}
    </div>
  );
};

export default CreneauxPage;

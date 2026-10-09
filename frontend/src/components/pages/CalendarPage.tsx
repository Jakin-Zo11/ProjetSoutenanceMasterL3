import React, { useMemo, useState } from 'react';
import { CalendarDays, Users } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

const ROLE_LABELS: Record<string, string> = {
  PRESIDENT: 'Président',
  RAPPORTEUR: 'Rapporteur',
  EXAMINER: 'Examinateur',
  ENCADREUR: 'Encadreur',
};

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const WORK_START = '07:00';
const WORK_END = '18:00';
const CALENDAR_MAX_HEIGHT = 500;

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const startOfWeek = (date: Date) => {
  const day = date.getUTCDay();
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return monday;
};

const isoWeek = (date: Date) => {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const formatTime = (value: string) => value.replace(':', 'h');

const formatDay = (date: Date) => new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
}).format(date);

const CalendarPage: React.FC = () => {
  const { session, defenseSlots, students, timeSlots } = useAdminData();

  const years = useMemo(
    () => Array.from(new Set(students.map((student) => student.promotion))).sort(),
    [students],
  );
  const [selectedYear, setSelectedYear] = useState(years[0] ?? '');
  const [selectedWeek, setSelectedWeek] = useState(0);

  const weekStarts = useMemo(() => {
    const start = new Date(`${session.startDate}T00:00:00Z`);
    const end = new Date(`${session.endDate}T00:00:00Z`);
    const weeks: Date[] = [];
    for (let cursor = startOfWeek(start); cursor <= end; cursor = addDays(cursor, 7)) {
      weeks.push(new Date(cursor));
    }
    return weeks;
  }, [session.startDate, session.endDate]);

  const safeWeekIndex = Math.min(selectedWeek, Math.max(weekStarts.length - 1, 0));
  const weekStart = weekStarts[safeWeekIndex] ?? startOfWeek(new Date(`${session.startDate}T00:00:00Z`));
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const weekKeys = useMemo(() => weekDays.map(dateKey), [weekDays]);
  const studentById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);

  const weekDefenses = useMemo(() => defenseSlots
    .filter((slot) => {
      if (!weekKeys.includes(slot.date)) return false;
      const student = studentById.get(slot.studentId);
      return !selectedYear || student?.promotion === selectedYear;
    })
    .sort((first, second) => `${first.date}T${first.timeStart}`.localeCompare(`${second.date}T${second.timeStart}`)), [defenseSlots, weekKeys, selectedYear, studentById]);

  const timeRows = useMemo(() => {
    const rows = new Set<string>(timeSlots.map((timeSlot) => timeSlot.startTime));
    weekDefenses.forEach((slot) => rows.add(slot.timeStart));
    return Array.from(rows)
      .filter((time) => time >= WORK_START && time < WORK_END)
      .sort();
  }, [timeSlots, weekDefenses]);

  return (
    <div className="flex max-h-[calc(100vh-2rem)] flex-col gap-4 overflow-hidden">
      <section className="flex shrink-0 flex-wrap items-center gap-4 rounded-xl border border-[#BFDBFE] bg-white p-4">
        <CalendarDays className="text-[#1E3A8A]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-[#0A192F]">Emploi du temps des soutenances</h2>
          <p className="text-sm text-[#475569]">
            Période officielle : {session.startDate} – {session.endDate} · {weekDefenses.length} soutenance(s) sur la semaine affichée
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="text-sm font-medium text-[#334155]">
            Année scolaire
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="mt-1 block w-40 rounded-lg border border-[#DDEAF7] p-2.5"
            >
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-[#334155]">
            Semaine de soutenance
            <select
              value={safeWeekIndex}
              onChange={(event) => setSelectedWeek(Number(event.target.value))}
              className="mt-1 block w-64 rounded-lg border border-[#DDEAF7] p-2.5"
            >
              {weekStarts.map((week, index) => (
                <option key={dateKey(week)} value={index}>
                  Semaine {isoWeek(week)} · du {formatDay(week)} au {formatDay(addDays(week, 6))}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-[#DDEAF7] bg-white">
        <div className="h-full overflow-auto" style={{ maxHeight: CALENDAR_MAX_HEIGHT }}>
          <div className="min-w-[980px]">
            <div className="sticky top-0 z-10 grid border-b border-[#DDEAF7] bg-[#F0F5FB]" style={{ gridTemplateColumns: '96px repeat(7, minmax(150px, 1fr))' }}>
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#334155]">Horaire</div>
              {weekDays.map((day) => (
                <div key={dateKey(day)} className="border-l border-[#DDEAF7] px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#334155]">{DAY_LABELS[day.getUTCDay() === 0 ? 6 : day.getUTCDay() - 1]}</p>
                  <p className="text-sm font-semibold text-[#0A192F]">{formatDay(day)}</p>
                </div>
              ))}
            </div>

            {timeRows.map((timeRow) => (
              <div key={timeRow} className="grid border-b border-[#DDEAF7] last:border-b-0" style={{ gridTemplateColumns: '96px repeat(7, minmax(150px, 1fr))' }}>
                <div className="bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#1E3A8A]">{formatTime(timeRow)}</div>
                {weekDays.map((day) => {
                  const cellDefenses = weekDefenses.filter((slot) => slot.date === dateKey(day) && slot.timeStart === timeRow);
                  return (
                    <div key={`${dateKey(day)}-${timeRow}`} className="min-h-[64px] space-y-1.5 border-l border-[#DDEAF7] p-1.5">
                      {cellDefenses.map((slot) => {
                        const student = studentById.get(slot.studentId);
                        return (
                          <article key={slot.id} className="rounded-lg border-l-4 border-[#3B82F6] bg-[#EFF6FF] p-2">
                            <p className="text-xs font-semibold text-[#1E3A8A]">
                              {formatTime(slot.timeStart)}–{formatTime(slot.timeEnd)} · {slot.room}
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-[#0A192F]">{slot.studentName}</p>
                            {student && <p className="text-[11px] text-[#475569]">{student.matricule} · {student.themeTitle}</p>}
                            <p className="mt-1 flex items-start gap-1 text-[11px] text-[#1E3A8A]">
                              <Users size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                              <span>
                                {slot.jury.length
                                  ? slot.jury.map((member) => `${member.teacherName} (${ROLE_LABELS[member.role] ?? member.role})`).join(' · ')
                                  : 'Évaluateurs à affecter'}
                              </span>
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}

            {timeRows.length === 0 && (
              <p className="p-6 text-center text-sm text-[#637799]">Aucun horaire sur la plage 07h00–18h00 pour cette semaine.</p>
            )}
          </div>
        </div>
      </div>

      {weekDefenses.length === 0 && (
        <p className="shrink-0 rounded-xl border border-dashed border-[#DDEAF7] bg-white p-3 text-center text-sm text-[#637799]">
          Aucune soutenance planifiée pour cette année et cette semaine.
        </p>
      )}
    </div>
  );
};

export default CalendarPage;

"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import {
  defaultPetFormValues,
  PetFormValues,
  PetRecord,
  PetReminder,
  PetSummary
} from "../../src/pets/types";

type TabId = "listado" | "resumen" | "cuidados";
type StatusFilter = "all" | "healthy" | "attention" | "checkup";

const healthLabel: Record<PetRecord["healthStatus"], string> = {
  healthy: "Saludable",
  attention: "Requiere atención",
  checkup: "Chequeo pendiente"
};

const vaccinationLabel: Record<PetRecord["vaccinationStatus"], string> = {
  up_to_date: "Vacunas al día",
  pending: "Vacunas pendientes",
  overdue: "Vacunas vencidas"
};

const healthToneClass: Record<PetRecord["healthStatus"], string> = {
  healthy: "tone-positive",
  attention: "tone-critical",
  checkup: "tone-warning"
};

const vaccinationToneClass: Record<PetRecord["vaccinationStatus"], string> = {
  up_to_date: "tone-positive",
  pending: "tone-warning",
  overdue: "tone-critical"
};

function mapPetToFormValues(pet: PetRecord): PetFormValues {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    ageYears: pet.ageYears,
    healthStatus: pet.healthStatus,
    vaccinationStatus: pet.vaccinationStatus,
    photoUrl: pet.photoUrl,
    nextCareAt: pet.nextCareAt ? pet.nextCareAt.slice(0, 16) : "",
    notes: pet.notes
  };
}

function formatShortDate(date: string | null): string {
  if (!date) {
    return "Sin fecha";
  }

  return new Date(date).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short"
  });
}

function formatLongDate(date: string | null): string {
  if (!date) {
    return "Sin programación";
  }

  return new Date(date).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function petInitials(pet: PetRecord): string {
  return pet.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabId>("listado");
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [summary, setSummary] = useState<PetSummary | null>(null);
  const [reminders, setReminders] = useState<PetReminder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<PetFormValues>(defaultPetFormValues);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadData(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const [petsResponse, summaryResponse, remindersResponse] = await Promise.all([
        fetch("/api/ms-pets/pets", { credentials: "include", cache: "no-store" }),
        fetch("/api/ms-pets/pets/summary", { credentials: "include", cache: "no-store" }),
        fetch("/api/ms-pets/pets/reminders", { credentials: "include", cache: "no-store" })
      ]);

      if (!petsResponse.ok || !summaryResponse.ok || !remindersResponse.ok) {
        throw new Error("No fue posible cargar los datos de mascotas.");
      }

      const [petsData, summaryData, remindersData] = await Promise.all([
        petsResponse.json() as Promise<PetRecord[]>,
        summaryResponse.json() as Promise<PetSummary>,
        remindersResponse.json() as Promise<PetReminder[]>
      ]);

      setPets(petsData);
      setSummary(summaryData);
      setReminders(remindersData);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Ocurrió un problema inesperado al cargar mascotas.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const text = `${pet.name} ${pet.species} ${pet.breed}`.toLowerCase();
      const searchMatches = text.includes(search.trim().toLowerCase());
      const statusMatches = statusFilter === "all" ? true : pet.healthStatus === statusFilter;
      return searchMatches && statusMatches;
    });
  }, [pets, search, statusFilter]);

  const petsNeedingFollowUp = useMemo(() => {
    return pets.filter((pet) => pet.healthStatus !== "healthy" || pet.vaccinationStatus !== "up_to_date");
  }, [pets]);

  function openCreateModal(): void {
    setEditingPetId(null);
    setFormValues(defaultPetFormValues);
    setIsModalOpen(true);
  }

  function openEditModal(pet: PetRecord): void {
    setEditingPetId(pet.id);
    setFormValues(mapPetToFormValues(pet));
    setIsModalOpen(true);
  }

  async function submitPet(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    const payload = {
      ...formValues,
      ageYears: Number(formValues.ageYears),
      nextCareAt: formValues.nextCareAt ? new Date(formValues.nextCareAt).toISOString() : null
    };

    startTransition(() => {
      void (async () => {
        const endpoint = editingPetId ? `/api/ms-pets/pets/${editingPetId}` : "/api/ms-pets/pets";
        const method = editingPetId ? "PATCH" : "POST";
        const response = await fetch(endpoint, {
          method,
          credentials: "include",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { message?: string } | null;
          setError(body?.message ?? "No fue posible guardar la mascota.");
          return;
        }

        setIsModalOpen(false);
        await loadData();
      })();
    });
  }

  function deletePet(id: string): void {
    startTransition(() => {
      void (async () => {
        const response = await fetch(`/api/ms-pets/pets/${id}`, {
          method: "DELETE",
          credentials: "include"
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { message?: string } | null;
          setError(body?.message ?? "No fue posible eliminar la mascota.");
          return;
        }

        await loadData();
      })();
    });
  }

  return (
    <div className="fresh-shell">
      <aside className="fresh-sidebar">
        <div className="sidebar-brand-block">
          <p className="brand-mark">PetitCare</p>
          <p className="sidebar-caption">Rutinas domésticas para cuidar mejor a cada mascota.</p>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-link" type="button">
            Inicio
          </button>
          <button className="sidebar-link sidebar-link-active" type="button" onClick={() => setActiveTab("listado")}>
            Mascotas
          </button>
          <button className="sidebar-link" type="button" onClick={() => setActiveTab("cuidados")}>
            Cuidados
          </button>
          <button className="sidebar-link" type="button">
            Ajustes
          </button>
        </nav>

        <div className="sidebar-account">
          <span className="sidebar-account-avatar">MI</span>
          <div>
            <strong>Mi hogar</strong>
            <p>Modo público de prueba sin autenticación</p>
          </div>
        </div>
      </aside>

      <main className="fresh-main">
        <header className="fresh-header">
          <div>
            <h1 className="display-title">Mi Hogar</h1>
            <p className="header-subtitle">
              {summary ? `${summary.totalPets} mascotas bajo tu cuidado` : "Administra salud y rutinas del hogar"}
            </p>
          </div>

          <div className="header-actions">
            <button className="primary-cta" type="button" onClick={openCreateModal}>
              Anadir Mascota
            </button>
          </div>
        </header>

        <div className="segmented-tabs" role="tablist" aria-label="Pestañas de mascotas">
          {[
            { id: "listado", label: "Listado" },
            { id: "resumen", label: "Resumen" },
            { id: "cuidados", label: "Cuidados" }
          ].map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "segment is-active" : "segment"}
              type="button"
              onClick={() => setActiveTab(tab.id as TabId)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? <div className="status-banner status-banner-error">{error}</div> : null}
        {loading ? <div className="status-banner">Cargando mascotas y recordatorios...</div> : null}

        {summary ? (
          <section className="kpi-grid">
            <article className="kpi-card">
              <span>Total mascotas</span>
              <strong>{String(summary.totalPets).padStart(2, "0")}</strong>
            </article>
            <article className="kpi-card kpi-card-highlight">
              <span>Vacunas al día</span>
              <strong>{String(summary.vaccinatedPets).padStart(2, "0")}</strong>
            </article>
            <article className="kpi-card">
              <span>Alertas activas</span>
              <strong>{String(summary.petsNeedingAttention).padStart(2, "0")}</strong>
            </article>
            <article className="kpi-card">
              <span>Rutinas semanales</span>
              <strong>{String(reminders.length).padStart(2, "0")}</strong>
            </article>
          </section>
        ) : null}

        {activeTab === "listado" ? (
          <section className="fresh-content-grid">
            <div className="list-area">
              <div className="filters-row">
                <label className="search-input">
                  <span>Buscar mascota</span>
                  <input
                    placeholder="Nombre, especie o raza"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>

                <div className="filter-pills" aria-label="Filtro por salud">
                  {[
                    { value: "all", label: "Todos" },
                    { value: "healthy", label: "Saludables" },
                    { value: "attention", label: "Atención" },
                    { value: "checkup", label: "Chequeos" }
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      className={statusFilter === filter.value ? "pill is-active" : "pill"}
                      type="button"
                      onClick={() => setStatusFilter(filter.value as StatusFilter)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pet-card-list">
                {filteredPets.map((pet) => (
                  <article key={pet.id} className="pet-card">
                    <div className="pet-card-media">
                      {pet.photoUrl ? (
                        <img alt={pet.name} src={pet.photoUrl} />
                      ) : (
                        <span>{petInitials(pet)}</span>
                      )}
                    </div>

                    <div className="pet-card-body">
                      <div className="pet-card-header">
                        <div>
                          <h3>{pet.name}</h3>
                          <p>
                            {pet.breed}, {pet.ageYears} años
                          </p>
                        </div>
                        <div className="pet-card-actions">
                          <button className="icon-button" type="button" onClick={() => openEditModal(pet)}>
                            Editar
                          </button>
                          <button className="icon-button danger" type="button" onClick={() => deletePet(pet.id)}>
                            Eliminar
                          </button>
                        </div>
                      </div>

                      <div className="pet-meta-row">
                        <span className={`tone-chip ${healthToneClass[pet.healthStatus]}`}>
                          {healthLabel[pet.healthStatus]}
                        </span>
                        <span className={`tone-chip ${vaccinationToneClass[pet.vaccinationStatus]}`}>
                          {vaccinationLabel[pet.vaccinationStatus]}
                        </span>
                        <span className="meta-note">Próximo cuidado: {formatShortDate(pet.nextCareAt)}</span>
                      </div>

                      <p className="pet-card-notes">{pet.notes || "Sin notas adicionales registradas."}</p>
                    </div>
                  </article>
                ))}

                {!filteredPets.length ? (
                  <div className="empty-state-card">
                    <h3>No hay mascotas para este filtro</h3>
                    <p>Ajusta la búsqueda o registra una nueva ficha desde el botón principal.</p>
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="side-stack">
              <section className="summary-card">
                <div className="summary-card-header">
                  <h3>Totales</h3>
                </div>
                <div className="summary-mini-grid">
                  <article>
                    <strong>{summary?.totalPets ?? pets.length}</strong>
                    <span>Mascotas</span>
                  </article>
                  <article>
                    <strong>{reminders.length}</strong>
                    <span>Recordatorios</span>
                  </article>
                </div>
              </section>

              <section className="summary-card">
                <div className="summary-card-header">
                  <h3>Próximas citas</h3>
                </div>
                <div className="event-list">
                  {reminders.slice(0, 3).map((reminder) => (
                    <article key={reminder.id} className="event-item">
                      <span className="event-dot" />
                      <div>
                        <strong>{reminder.petName}</strong>
                        <p>
                          {formatLongDate(reminder.nextCareAt)} · {reminder.message}
                        </p>
                      </div>
                    </article>
                  ))}
                  {!reminders.length ? (
                    <article className="event-item is-empty">
                      <span className="event-dot muted" />
                      <div>
                        <strong>Sin citas próximas</strong>
                        <p>Cuando programes un cuidado aparecerá aquí.</p>
                      </div>
                    </article>
                  ) : null}
                </div>
              </section>

              <section className="insurance-card">
                <h3>Bienestar del hogar</h3>
                <p>Centraliza fichas, alertas y controles del grupo completo en una sola vista.</p>
              </section>
            </aside>
          </section>
        ) : null}

        {activeTab === "resumen" && summary ? (
          <section className="summary-layout">
            <div className="timeline-panel">
              <div className="panel-head">
                <h3>Línea de tiempo de vacunación</h3>
                <p>Seguimiento rápido del próximo hito sanitario por mascota.</p>
              </div>

              <div className="timeline-row">
                {pets.map((pet) => (
                  <article key={pet.id} className="timeline-card">
                    <div className="timeline-avatar">{pet.photoUrl ? <img alt={pet.name} src={pet.photoUrl} /> : petInitials(pet)}</div>
                    <strong>{pet.name}</strong>
                    <span>{formatShortDate(pet.nextCareAt)}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="planner-panel">
              <div className="panel-head">
                <h3>Resumen de bienestar</h3>
                <p>Señales simples para revisar actividad y seguimientos pendientes.</p>
              </div>

              <div className="wellness-chart">
                {[48, 62, 36, 78, 100, 66, 52].map((height, index) => (
                  <span key={index} style={{ height: `${height}%` }} />
                ))}
              </div>

              <ul className="notes-list">
                {petsNeedingFollowUp.length ? (
                  petsNeedingFollowUp.map((pet) => (
                    <li key={pet.id}>
                      <strong>{pet.name}</strong>
                      <p>
                        {healthLabel[pet.healthStatus]} · {vaccinationLabel[pet.vaccinationStatus]}
                      </p>
                    </li>
                  ))
                ) : (
                  <li>
                    <strong>Sin alertas de salud</strong>
                    <p>Todas las mascotas se encuentran con controles al día.</p>
                  </li>
                )}
              </ul>
            </div>

            <div className="species-panel">
              <div className="panel-head">
                <h3>Distribución por especie</h3>
                <p>Relación entre volumen, salud y necesidad de seguimiento.</p>
              </div>

              <div className="species-breakdown">
                {summary.speciesBreakdown.map((item) => (
                  <article key={item.species} className="species-stat">
                    <h4>{item.species}</h4>
                    <strong>{item.total}</strong>
                    <p>{item.healthy} saludables</p>
                    <p>{item.attention} con alerta</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "cuidados" ? (
          <section className="care-layout">
            <div className="planner-board">
              <div className="panel-head">
                <h3>Planificador semanal</h3>
                <p>Recordatorios próximos para vacunas, controles y rutinas domésticas.</p>
              </div>

              <div className="planner-list">
                {reminders.map((reminder) => (
                  <article key={reminder.id} className="planner-item">
                    <div className="planner-date">
                      <span>{new Date(reminder.nextCareAt).toLocaleDateString("es-CL", { weekday: "short" })}</span>
                      <strong>{new Date(reminder.nextCareAt).getDate()}</strong>
                    </div>
                    <div className="planner-copy">
                      <strong>{reminder.petName}</strong>
                      <p>{reminder.message}</p>
                    </div>
                    <span className="planner-species">{reminder.species}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-header">
                <h3>Tareas pendientes</h3>
              </div>
              <ul className="notes-list compact">
                {reminders.length ? (
                  reminders.map((reminder) => (
                    <li key={reminder.id}>
                      <strong>{reminder.petName}</strong>
                      <p>{formatLongDate(reminder.nextCareAt)}</p>
                    </li>
                  ))
                ) : (
                  <li>
                    <strong>Sin tareas programadas</strong>
                    <p>La agenda se llenará con los próximos cuidados registrados.</p>
                  </li>
                )}
              </ul>
            </div>
          </section>
        ) : null}
      </main>

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div className="fresh-modal" role="dialog" aria-modal="true" aria-labelledby="pet-modal-title">
            <div className="fresh-modal-header">
              <div>
                <h2 id="pet-modal-title">{editingPetId ? "Editar mascota" : "Nueva Mascota"}</h2>
                <p>Completa los detalles para comenzar el seguimiento de su cuidado.</p>
              </div>
              <button className="modal-close" type="button" onClick={() => setIsModalOpen(false)}>
                Cerrar
              </button>
            </div>

            <form className="fresh-modal-form" onSubmit={submitPet}>
              <div className="modal-photo-panel">
                <div className="photo-dropzone">
                  {formValues.photoUrl ? (
                    <img alt={formValues.name || "Mascota"} src={formValues.photoUrl} />
                  ) : (
                    <>
                      <span className="photo-dropzone-icon">+</span>
                      <p>Subir Foto</p>
                    </>
                  )}
                </div>
                <label>
                  <span>URL de foto</span>
                  <input
                    value={formValues.photoUrl}
                    onChange={(event) => setFormValues((current) => ({ ...current, photoUrl: event.target.value }))}
                  />
                </label>
              </div>

              <div className="modal-fields">
                <div className="modal-grid">
                  <label className="field wide">
                    <span>Nombre</span>
                    <input
                      required
                      value={formValues.name}
                      onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Especie</span>
                    <input
                      required
                      value={formValues.species}
                      onChange={(event) => setFormValues((current) => ({ ...current, species: event.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Raza</span>
                    <input
                      required
                      value={formValues.breed}
                      onChange={(event) => setFormValues((current) => ({ ...current, breed: event.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Edad (años)</span>
                    <input
                      min={0}
                      type="number"
                      value={formValues.ageYears}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, ageYears: Number(event.target.value) }))
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Próximo cuidado</span>
                    <input
                      type="datetime-local"
                      value={formValues.nextCareAt}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, nextCareAt: event.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className="health-switcher">
                  <span>Estado de salud</span>
                  <div className="health-switcher-buttons">
                    {[
                      { id: "healthy", label: "Saludable" },
                      { id: "attention", label: "En tratamiento" },
                      { id: "checkup", label: "Revisión" }
                    ].map((option) => (
                      <button
                        key={option.id}
                        className={formValues.healthStatus === option.id ? "switch-pill is-active" : "switch-pill"}
                        type="button"
                        onClick={() =>
                          setFormValues((current) => ({
                            ...current,
                            healthStatus: option.id as PetRecord["healthStatus"]
                          }))
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="field">
                  <span>Vacunación</span>
                  <select
                    value={formValues.vaccinationStatus}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        vaccinationStatus: event.target.value as PetRecord["vaccinationStatus"]
                      }))
                    }
                  >
                    <option value="up_to_date">Al día</option>
                    <option value="pending">Pendiente</option>
                    <option value="overdue">Vencida</option>
                  </select>
                </label>

                <label className="field">
                  <span>Notas adicionales</span>
                  <textarea
                    rows={4}
                    value={formValues.notes}
                    onChange={(event) => setFormValues((current) => ({ ...current, notes: event.target.value }))}
                  />
                </label>
              </div>

              <div className="fresh-modal-footer">
                <button className="secondary-cta wide" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button className="primary-cta wide" disabled={isPending} type="submit">
                  {isPending ? "Guardando..." : "Guardar Mascota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PetsDashboard() {
  return <DashboardContent />;
}

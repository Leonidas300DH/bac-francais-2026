import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

afterEach(() => {
  window.localStorage.clear();
});

describe("study app interface", () => {
  it("renders dashboard progress controls", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Progression globale")).toBeInTheDocument();
    expect(screen.getByText("Reprise rapide")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Prochain texte" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ouvrir l'atelier/i })).toHaveAttribute("href", "/figures");
    expect(screen.getByRole("link", { name: /Ouvrir les mémos/i })).toHaveAttribute("href", "/memo");
    expect(screen.getByRole("link", { name: /Ouvrir la grammaire/i })).toHaveAttribute("href", "/grammaire");
  });

  it("renders global oral memo cards", () => {
    render(
      <MemoryRouter initialEntries={["/memo"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Mémos d'oral" })).toBeInTheDocument();
    expect(screen.getByText("Mémos prêts")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "À revoir" })).toHaveLength(16);
    expect(screen.getAllByRole("link", { name: "Ouvrir la fiche" })).toHaveLength(16);
  });

  it("persists oral memo knowledge locally", () => {
    render(
      <MemoryRouter initialEntries={["/memo"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "À revoir" })[0]);

    expect(screen.getByText("1/16")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("bac-francais-2026:les-effares") ?? "{}")).toMatchObject({
      completedSections: { memo: true },
    });
  });

  it("links memo quotes to highlighted source lines", () => {
    render(
      <MemoryRouter initialEntries={["/memo"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("link", { name: /Noirs dans la neige/i })[0]).toHaveAttribute(
      "href",
      "/textes/les-effares?ligne=1#texte-source",
    );
  });

  it("renders a global figure revision workshop", () => {
    render(
      <MemoryRouter initialEntries={["/figures"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Réviser les figures de style" })).toBeInTheDocument();
    expect(screen.getByText("Textes couverts")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Ouvrir" }).length).toBeGreaterThan(10);
  });

  it("renders grammar training cards", () => {
    render(
      <MemoryRouter initialEntries={["/grammaire"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Grammaire en 2 minutes" })).toBeInTheDocument();
    expect(screen.getByText("Textes couverts")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "À revoir" })).toHaveLength(16);
    expect(screen.getAllByRole("link", { name: "Voir Vers 4" }).map((link) => link.getAttribute("href"))).toContain(
      "/textes/les-effares?ligne=4#texte-source",
    );
  });

  it("persists grammar question knowledge locally", () => {
    render(
      <MemoryRouter initialEntries={["/grammaire"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "À revoir" })[0]);

    expect(screen.getByText("1/16")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("bac-francais-2026:les-effares") ?? "{}")).toMatchObject({
      completedSections: {
        grammaire: true,
        "grammaire:g-les-effares-1": true,
      },
    });
  });

  it("does not repeat the official method block inside a study fiche", () => {
    render(
      <MemoryRouter initialEntries={["/textes/les-effares"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Méthode de l'analyse linéaire")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Méthode" })).not.toBeInTheDocument();
  });

  it("provides a dedicated figure revision section on study fiches", () => {
    render(
      <MemoryRouter initialEntries={["/textes/les-effares"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Réviser les figures de style")).toBeInTheDocument();
    expect(screen.getByText(/procédés repérés dans cette fiche/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Champ lexical du froid/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Atelier figures" })).toHaveAttribute("href", "/figures");
    expect(screen.getByRole("link", { name: "Mémos" })).toHaveAttribute("href", "/memo");
    expect(screen.getByRole("link", { name: "Grammaire" })).toHaveAttribute("href", "/grammaire");
  });

  it("can open a study fiche with a requested source line highlighted", () => {
    render(
      <MemoryRouter initialEntries={["/textes/les-ruses-du-tyran?ligne=12-12#texte-source"]}>
        <App />
      </MemoryRouter>,
    );

    const activeLine = document.querySelector(".verse.active");

    expect(activeLine).toHaveTextContent("12");
    expect(activeLine).toHaveTextContent("friandise du ver,");
  });

  it("can reveal quiz answers directly", () => {
    render(
      <MemoryRouter initialEntries={["/textes/les-effares"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Afficher la réponse" })[0]);

    expect(screen.getByText(/Réponse attendue/)).toBeInTheDocument();
    expect(screen.getAllByText(/Le poème montre cinq enfants affamés/).length).toBeGreaterThan(1);
  });
});

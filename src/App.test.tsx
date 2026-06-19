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

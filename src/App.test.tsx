import { render, screen } from "@testing-library/react";
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
  });
});

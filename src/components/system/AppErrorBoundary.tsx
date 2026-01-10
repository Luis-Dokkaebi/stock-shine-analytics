import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: unknown;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // Keep this for diagnostics in the browser console.
    console.error("App crashed:", error);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const message =
      this.state.error instanceof Error
        ? this.state.error.message
        : "Ocurrió un error inesperado.";

    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center p-6">
        <div className="w-full max-w-xl rounded-xl border bg-card p-6">
          <h1 className="text-xl font-semibold">No se pudo cargar la página</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A veces esto pasa por caché del navegador o un error temporal del build.
          </p>
          <div className="mt-4 rounded-md bg-muted p-3 font-mono text-xs text-foreground/90">
            {message}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={this.handleReload}>Recargar</Button>
            <Button variant="secondary" onClick={() => (window.location.href = "/")}>
              Ir al Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

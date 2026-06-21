export interface UsuarioSesion {
  nombre: string;
  rol: string;
}

export const usuarioActual: UsuarioSesion = {
  nombre: "Jordi Gasta",
  rol: "Responsable de Planta",
};

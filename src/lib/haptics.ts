
export const haptics = {
  /**
   * Vibração leve (Impacto suave)
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Vibração média (Impacto de sucesso)
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },

  /**
   * Vibração de sucesso (Dois toques rápidos)
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 30, 20]);
    }
  },

  /**
   * Vibração de erro (Toque longo ou múltiplos rápidos)
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  }
};

// Enhanced API mocks helper for Emergency Response Protocol testing

/**
 * Enhanced mock helper with validation
 * @param {Object} routeMatcher - Cypress route matcher (method, url, etc.)
 * @param {Object|Function} response - Response data or function
 * @param {Object} options - Additional options (alias, delay, validation)
 */
export const mock = (routeMatcher, response, options = {}) => {
    const { alias, delayMs = 0 } = options;
    
    const generatedAlias = alias || generateAlias(routeMatcher);
    
    return cy.intercept(routeMatcher, (req) => {
      // Apply delay if specified
      if (delayMs > 0) {
        req.on('response', (res) => {
          res.setDelay(delayMs);
        });
      }
      
      req.reply(response);
    }).as(generatedAlias);
  };
  
  /**
   * Generate consistent alias names from route matchers
   */
  function generateAlias(routeMatcher) {
    const method = (routeMatcher.method || 'GET').toLowerCase();
    const url = String(routeMatcher.url || routeMatcher).replace(/[^\w]/g, '_');
    return `${method}_${url.slice(0, 20)}`;
  }
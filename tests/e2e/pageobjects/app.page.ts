class App {
  /**
   * elements
   */
  get heading() {
    return $("h1");
  }

  /**
   * methods
   */
  public open(path = "/") {
    browser.url(path);
  }
}

export default new App();

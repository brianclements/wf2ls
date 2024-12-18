class AppState {
  #totalNumJobs;
  #jobProgress;
  #progressBar;
  isTestInstance = false;

/*
 * @params:
 *  {cliProgres}, progress bar intance, use undefined for testing instances
 *  <testing:boolen>, is this an instance for testing?
 */
  constructor(appProgressBar, testing) {
    this.#totalNumJobs = 0;
    this.#jobProgress = 0;
    this.pages = new Map();
    this.mirrors = new Map();
    if (appProgressBar) this.#progressBar = appProgressBar;
    if (testing) this.isTestInstance = testing;
  }

  addJob() {
    this.#totalNumJobs++;
    if (!this.isTestInstance) this.#progressBar.setTotal(this.#totalNumJobs);
  }

  addPage(pName, pageStr) {
    // TODO: A page specifically named "Orphans" needs to be detected and
    // appended to rather than overwritten. That page is for nodes that have
    // the newPageTag but end up with an empty node name or spaces as a result
    // of stripTag(). 
    this.pages.set(pName, pageStr);
  }

  incrementJobProgress() {
    this.#jobProgress++;
    if (!this.isTestInstance) this.#progressBar.update(this.#jobProgress);
  }

  startProgressBar() {
    if (!this.isTestInstance) this.#progressBar.start(this.#totalNumJobs, 0);
  }

  stopProgressBar() {
    if (!this.isTestInstance) this.#progressBar.stop();
  }
}

export { 
  AppState
};

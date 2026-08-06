package com.mycompany.myapp.web.rest.vm;

/**
 * View Model for the registration result.
 */
public class RegisterResultVM {

    private boolean autoActivated;

    public RegisterResultVM() {}

    public RegisterResultVM(boolean autoActivated) {
        this.autoActivated = autoActivated;
    }

    public boolean isAutoActivated() {
        return autoActivated;
    }

    public void setAutoActivated(boolean autoActivated) {
        this.autoActivated = autoActivated;
    }
}

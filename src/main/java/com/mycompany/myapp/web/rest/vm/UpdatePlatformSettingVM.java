package com.mycompany.myapp.web.rest.vm;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * View model for updating a platform setting value.
 */
public class UpdatePlatformSettingVM {

    @NotNull
    @Size(max = 1000)
    private String value;

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}

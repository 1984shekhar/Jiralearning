package com.example.plugins.myjiraplugin;
import com.atlassian.plugin.event.PluginEventListener;
import com.atlassian.plugin.event.PluginEventManager;
import com.atlassian.plugin.event.events.PluginEnabledEvent;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.sal.api.ApplicationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;

@Named
public class PluginInitializer {

    private static final Logger log = LoggerFactory.getLogger(PluginInitializer.class);

    private final ApplicationProperties applicationProperties;
    private final PluginEventManager pluginEventManager;

    @Inject
    public PluginInitializer(
            @ComponentImport ApplicationProperties applicationProperties,
            @ComponentImport PluginEventManager pluginEventManager) {
        this.applicationProperties = applicationProperties;
        this.pluginEventManager = pluginEventManager;
        this.pluginEventManager.register(this);
        log.warn("PluginInitializer constructor called");
    }

    @PluginEventListener
    public void onPluginEnabled(PluginEnabledEvent event) {
        log.warn("==========================================");
        log.warn("Plugin has been enabled: " + event.getPlugin().getKey());
        log.warn("==========================================");
    }
}
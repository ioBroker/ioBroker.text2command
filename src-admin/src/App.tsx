import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { Loader, I18n, GenericApp, type GenericAppProps, type GenericAppState } from '@iobroker/adapter-react-v5';

import Layout from './components/Layout';
import enLang from './i18n/en.json';
import deLang from './i18n/de.json';
import ruLang from './i18n/ru.json';
import ptLang from './i18n/pt.json';
import nlLang from './i18n/nl.json';
import frLang from './i18n/fr.json';
import itLang from './i18n/it.json';
import esLang from './i18n/es.json';
import plLang from './i18n/pl.json';
import ukLang from './i18n/uk.json';
import zhLang from './i18n/zh-cn.json';
import type { Text2CommandAdapterConfig } from './types';
import { Box } from '@mui/material';

declare global {
    interface Window {
        sentryDSN: string;
        adapterName: string | undefined;
    }
}

interface AppState extends GenericAppState {
    systemConfig: ioBroker.SystemConfigObject | null;
    config: Text2CommandAdapterConfig | false;
    ready: boolean;
}

export default class App extends GenericApp<GenericAppProps, AppState> {
    constructor(props: GenericAppProps) {
        const extendedProps = { ...props };
        extendedProps.translations = {
            en: enLang,
            de: deLang,
            ru: ruLang,
            pt: ptLang,
            nl: nlLang,
            fr: frLang,
            it: itLang,
            es: esLang,
            pl: plLang,
            uk: ukLang,
            'zh-cn': zhLang,
        };

        extendedProps.sentryDSN = window.sentryDSN;
        super(props, extendedProps);
    }

    onConnectionReady(): void {
        const newState: Partial<AppState> = {};

        this.socket
            .getSystemConfig()
            .then(systemConfig => {
                newState.systemConfig = systemConfig;
                return this.readConfig();
            })
            .then(config => {
                // console.log(config);
                newState.config = config || false;
                newState.ready = true;
                this.setState(newState as AppState);
                if (config.language !== I18n.getLanguage() && config.language) {
                    I18n.setLanguage(config.language);
                }
            })
            .catch(e => this.showError(e));
    }

    readConfig = async (): Promise<Text2CommandAdapterConfig> => {
        let config = await this.socket.getObject(`system.adapter.${this.adapterName}.${this.instance}`);
        config ||= {} as ioBroker.InstanceObject;
        const native: Text2CommandAdapterConfig = (config.native || {}) as Text2CommandAdapterConfig;
        native.rules = native.rules || [];
        native.sayitInstance = native.sayitInstance || '';
        native.language = native.language || '';
        native.processorId = native.processorId || '';
        native.processorTimeout = native.processorTimeout || 1000;
        return native;
    };

    saveConfig = async (config: Text2CommandAdapterConfig): Promise<boolean> => {
        const obj = await this.socket.getObject(`system.adapter.${this.adapterName}.${this.instance}`);
        if (obj && JSON.stringify(obj.native) !== JSON.stringify(config)) {
            obj.native = config;
            await this.socket.setObject(obj._id, obj);
            return true;
        }

        return false; // nothing changed
    };

    render(): React.JSX.Element {
        if (!this.state.config || !this.state.ready) {
            return (
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={this.state.theme}>
                        <Loader themeType={this.state.themeType} />
                        {this.state.config === false ? <div>{I18n.t('No instance found')}</div> : null}
                    </ThemeProvider>
                </StyledEngineProvider>
            );
        }

        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <Box
                        sx={theme => ({
                            width: '100%',
                            height: 'calc(100% + 4px)',
                            backgroundColor: theme.palette.mode === 'dark' ? '#000' : '#fff',
                            overflowX: 'hidden',
                        })}
                    >
                        <Layout
                            themeType={this.state.themeType}
                            theme={this.state.theme}
                            socket={this.socket}
                            instance={this.instance}
                            readConfig={this.readConfig}
                            saveConfig={this.saveConfig}
                        />
                        {this.renderError()}
                    </Box>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}

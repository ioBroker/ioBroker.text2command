import React from 'react';
import isEqual from 'lodash.isequal';

import { withStyles } from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles';

import Loader from '@iobroker/adapter-react/Components/Loader';
import I18n from '@iobroker/adapter-react/i18n';
import GenericApp from '@iobroker/adapter-react/GenericApp';

import Layout from './components/Layout';

const styles = theme => ({
    root: {},
    logo: {
        width: 32,
        height: 32,
        padding: theme.spacing(1),
        display: 'inline-block',
    },
});

class App extends GenericApp {
    constructor(props) {
        const extendedProps = {...props};
        extendedProps.translations = {
            'en': require('./i18n/en'),
            'de': require('./i18n/de'),
            'ru': require('./i18n/ru'),
            'pt': require('./i18n/pt'),
            'nl': require('./i18n/nl'),
            'fr': require('./i18n/fr'),
            'it': require('./i18n/it'),
            'es': require('./i18n/es'),
            'pl': require('./i18n/pl'),
            'zh-cn': require('./i18n/zh-cn'),
        };

        super(props, extendedProps);
    }

    onConnectionReady() {
        const newState = {};

        this.socket
            .getSystemConfig()
            .then(systemConfig => {
                newState.systemConfig = systemConfig;
                return this.readConfig();
            })
            .then(config => {
                console.log(config);
                newState.config = config || false;
                newState.ready = true;
                this.setState(newState);
                if (config.language !== I18n.getLanguage() && config.language) {
                    I18n.setLanguage(config.language);
                }
            })
            .catch(e => this.showError(e));
    }

    readConfig() {
        return this.socket
            .getObject(`system.adapter.${this.adapterName}.${this.instance}`)
            .then(config => {
                config = config || {};
                const native = config.native || {};
                native.rules = native.rules || [];
                native.sayitInstance = native.sayitInstance || '';
                native.language = native.language || '';
                native.processorId = native.processorId || '';
                native.processorTimeout = native.processorTimeout || 1000;
                return native;
            });
    }

    saveConfig(config) {
        return this.socket
            .getObject(`system.adapter.${this.adapterName}.${this.instance}`)
            .then(obj => {
                if (!isEqual(obj.native, config)) {
                    obj.native = config;
                    return this.socket.setObject(
                        `system.adapter.${this.adapterName}.${this.instance}`,
                        obj
                    );
                }
            });
    }

    render() {
        if (!this.state.config || !this.state.ready) {
            return <MuiThemeProvider theme={this.state.theme}>
                <Loader theme={this.state.themeType} />
                {this.state.config === false ? <div>No instance found</div> : null}
            </MuiThemeProvider>;
        }

        return <MuiThemeProvider theme={this.state.theme}>
            <div className="App">
                <Layout
                    themeType={this.state.themeType}
                    theme={this.state.theme}
                    socket={this.socket}
                    instance={this.instance}
                    readConfig={this.readConfig.bind(this)}
                    saveConfig={this.saveConfig.bind(this)}
                />
                {this.renderError()}
            </div>
        </MuiThemeProvider>;
    }
}

export default withStyles(styles)(App);

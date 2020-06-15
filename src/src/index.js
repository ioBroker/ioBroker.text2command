import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { version } from '../package.json';
import theme from '@iobroker/adapter-react/Theme';

console.log('iobroker.text2command@' + version);
let themeName = (window.localStorage && window.localStorage.getItem('App.themeName')) || 'light';

const mainTheme = createMuiTheme({
    ...theme,
    colors: theme.colors[themeName],
});

console.log(mainTheme);

function build() {
    return ReactDOM.render(
        <MuiThemeProvider theme={mainTheme}>
            <App
                onThemeChange={_theme => {
                    themeName = _theme;
                    build();
                }}
            />
        </MuiThemeProvider>,
        document.getElementById('root')
    );
}

build();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

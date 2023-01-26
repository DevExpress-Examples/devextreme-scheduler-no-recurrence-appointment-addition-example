import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import themes from 'devextreme/ui/themes';

themes.initialized(() => {
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById('root')
    );
});

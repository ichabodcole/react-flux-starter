var React = require('react');

renderBaseElement();


function renderBaseElement() {
    React.render(
        /* jshint ignore:start */
        <div />,
        /* jshint ignore:end */
        document.getElementById('react-content')
    );
}

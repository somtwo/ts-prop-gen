const React = require('react');

let MyClass = React.createClass({
	propTypes: {
		foo: React.PropTypes.bool,
		bar: React.PropTypes.number
	},
	render: function() {
		return (<div>Hello world!</div>);
	}
});
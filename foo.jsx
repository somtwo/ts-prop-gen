const React = require('react');

var MyClass = React.createClass({
	propTypes: {
		foo: React.PropTypes.bool,
		bar: React.PropTypes.number
	},
	render: function() {
		return (<div>Hello world!</div>);
	}
});

var OtherClass = React.createClass({
	propTypes: {
		foo: React.PropTypes.bool,
		bar: React.PropTypes.number
	},
	render: function() {
		return (<div>Hello world!</div>);
	}
});
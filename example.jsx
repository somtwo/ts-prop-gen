const React = require('react');

var MyClass = React.createClass({
	propTypes: {
		foo: React.PropTypes.bool,
		bar: React.PropTypes.number,
		baz: React.PropTypes.func,
		qux: React.PropTypes.object,
		bad: React.PropTypes.symbol
	},
	render: function() {
		return (<div>Hello world!</div>);
	}
});

var OtherClass;

OtherClass = React.createClass({
	propTypes: {
		foo: React.PropTypes.bool
	},
	render: function() {
		return (<div>Hello world!</div>);
	}
});

module.exports = {
	'MyClass': MyClass,
	'OtherClass': OtherClass
}
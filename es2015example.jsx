import React, { Component, PropTypes } from 'react';

export default class Image extends Component {

	static propTypes = {
		description: PropTypes.string.isRequired,
		height: PropTypes.string.isRequired,
		isThumbnail: PropTypes.bool,
		src: PropTypes.string.isRequired,
		width: PropTypes.string.isRequired
	};

	constructor(props) {
		super(props);
	}

	render() {
		return (<div></div>);
	}
}
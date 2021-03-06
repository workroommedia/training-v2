var auth0Options = {
	configurationBaseUrl: 'https://cdn.auth0.com',
	allowedConnections: ['google-oauth2', 'linkedin', 'twitter', 'Username-Password-Authentication'],
	additionalSignUpFields: [
		{
			name: 'first_name',
			placeholder: 'First Name'
		},
		{
			name: 'last_name',
			placeholder: 'Last Name'
		}
	],
	closable: false,
	languageDictionary: {
		signUpTerms: "I agree to the <a href='https://neo4j.com/terms/online-trial-agreement/' style='text-decoration: underline' target='_blank'>terms of service</a> of Neo4j."
	},
	mustAcceptTerms: true,
	auth: {
		redirect: true,
		redirectUrl: 'https://neo4j.com/accounts/login',
		responseType: 'token id_token',
		audience: 'neo4j://accountinfo/',
		params: {
			scope: 'read:account-info write:account-info openid email profile user_metadata'
		}
	}
}

const classStates = {
	loggedIn: 'graph-academy-for-logged-in',
	notLoggedIn: 'graph-academy-for-not-logged-in'
}

class GraphAcademyLogin {
	constructor(options = {}) {
		console.log('constructor called');
		if (!Auth0Lock || typeof Auth0Lock !== 'function') return;
		console.log(options);
		this.lock = new Auth0Lock('DxhmiF8TCeznI7Xoi08UyYScLGZnk4ke', 'login.neo4j.com', auth0Options);
		this.options = options;
		this.checkSession(options.callback);
	}

	checkSession(cb) {
		this.lock.checkSession({}, async (err, result) => {
			console.log(result);
			if (result) {
				this.isLoggedIn = true;
				this.authResult = result;
				if (this.callback && typeof this.callback === 'function') this.callback()
			} else {
				this.isLoggedIn = false;
			}
			if (err && this.options.loginRedirectUrl) {
				this.redirectToLogin();
			}
			this.handleHtmlOnState(result ? 'loggedIn' : 'notLoggedIn');
			if (cb && typeof cb === 'function') cb(err, result);
		})
	}

	handleHtmlOnState(state = null) {
		const loggedInElements = document.getElementsByClassName(classStates['loggedIn']) || [];
		const notLoggedInElements = document.getElementsByClassName(classStates['notLoggedIn']) || [];
		if (state === 'loggedIn') {
			for (let item of loggedInElements) {
				item.style.display = 'inherit';
			}
			for (let item of notLoggedInElements) {
				item.style.display = 'none';
			}
		} else if (state === 'notLoggedIn') {
			for (let item of loggedInElements) {
				item.style.display = 'none';
			}
			for (let item of notLoggedInElements) {
				item.style.display = 'inherit';
			}
		}
	}

	logout() {
		const logoutOptions = {};
		if (this.options.redirectOnLogout) logoutOptions.redirectTo = this.options.redirectOnLogout;
		this.lock.logout(logoutOptions);
		this.handleHtmlOnState('notLoggedIn');
	}

	redirectToLogin() {
		return window.location.href = this.options.loginRedirectUrl;
	}
}
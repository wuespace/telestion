import { Then } from '@cucumber/cucumber';

Then(/^I see an error message$/, function () {});
Then(/^I see the message "([^"]*)"$/, function (message: string) {
	console.log(message);
});

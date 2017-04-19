import { Group } from "../../shared/FeedbackForm/Group";

export interface ProjectConfiguration {
	version: string,
	logging: {
		enabled: boolean
	},
	navigation: {
		"export": true
	},
	responsive: {
		enabled: boolean,
		fixedwidth: number
	},
	agreement: {
		enabled: boolean,
		text: any
	},
	languages: string[],
	interfaces: string[],
	feedback_form: Group[]
}
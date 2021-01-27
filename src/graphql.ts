/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum Days {
	MO = 'MO',
	TU = 'TU',
	WE = 'WE',
	TH = 'TH',
	FR = 'FR',
	SA = 'SA',
	SU = 'SU',
}

export enum StudyProgram {
	S = 'S',
	T = 'T',
	I = 'I',
}

export enum ClassType {
	LECT = 'LECT',
	LAB = 'LAB',
	DISC = 'DISC',
	FWK = 'FWK',
	PRAC = 'PRAC',
	IDPS = 'IDPS',
	SMNA = 'SMNA',
}

export class Class {
	type?: ClassType
	dayOfweek?: Days
	startTime?: string
	endTime?: string
	building?: string
	room?: string
	teacher?: string
}

export class Section {
	sectionNo?: number
	closed?: boolean
	registered?: number
	max?: number
	note?: string
	classes?: Class[]
}

export class Course {
	studyProgram?: StudyProgram
	semester?: number
	academicYear?: number
	courseNo?: string
	abbrName?: string
	courseNameTh?: string
	courseNameEn?: string
	faculty?: string
	credit?: number
	creditHours?: string
	courseCondition?: string
	midtermStart?: Date
	midtermEnd?: Date
	finalStart?: Date
	finalEnd?: Date
	sections?: Section[]
}

export abstract class IQuery {
	abstract courses(): Course[] | Promise<Course[]>

	abstract course(id: number): Course | Promise<Course>
}

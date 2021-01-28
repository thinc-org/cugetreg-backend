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

export enum Semester {
	_1 = '_1',
	_2 = '_2',
	_3 = '_3',
}

export enum GenEdType {
	SO = 'SO',
	SC = 'SC',
	HU = 'HU',
	IN = 'IN',
}

export class Period {
	start?: string
	end?: string
}

export class ExamPeriod {
	date?: Date
	period?: Period
}

export class StudentCount {
	current?: number
	max?: number
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
	students?: StudentCount
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
	genEdType?: GenEdType
	midterm?: ExamPeriod
	final?: ExamPeriod
	sections?: Section[]
}

export abstract class IQuery {
	abstract courses(): Course[] | Promise<Course[]>

	abstract course(id: number): Course | Promise<Course>
}

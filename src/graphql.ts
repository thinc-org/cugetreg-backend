
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum DayOfWeek {
    MO = "MO",
    TU = "TU",
    WE = "WE",
    TH = "TH",
    FR = "FR",
    SA = "SA",
    SU = "SU",
    IA = "IA",
    AR = "AR"
}

export enum StudyProgram {
    S = "S",
    T = "T",
    I = "I"
}

export enum ClassType {
    LECT = "LECT",
    LAB = "LAB",
    DISC = "DISC",
    FWK = "FWK",
    PRAC = "PRAC",
    IDPS = "IDPS",
    SMNA = "SMNA",
    STU = "STU",
    IA = "IA",
    OTHER = "OTHER",
    IDVS = "IDVS",
    AR = "AR",
    CLIN = "CLIN",
    TUT = "TUT",
    REFL = "REFL"
}

export enum GenEdType {
    SO = "SO",
    SC = "SC",
    HU = "HU",
    IN = "IN",
    NO = "NO"
}

export enum Interaction {
    L = "L",
    D = "D"
}

export enum Status {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

export class CourseEntryInput {
    courseId: string;
    studyProgram: string;
}

export class PeriodRangeInput {
    start: string;
    end: string;
}

export class FilterInput {
    keyword?: string;
    genEdTypes?: GenEdType[];
    dayOfWeeks?: DayOfWeek[];
    limit?: number;
    offset?: number;
    periodRange?: PeriodRangeInput;
}

export class CourseGroupInput {
    semester: string;
    academicYear: string;
    studyProgram: StudyProgram;
}

export class GenEdOverrideInput {
    genEdType: GenEdType;
    sections: string[];
}

export class OverrideInput {
    courseNo: string;
    studyProgram: StudyProgram;
    courseDesc?: string;
    genEd?: GenEdOverrideInput;
}

export class CreateReviewInput {
    rating: number;
    courseNo: string;
    semester: string;
    academicYear: string;
    studyProgram: StudyProgram;
    content?: string;
}

export class EditReviewInput {
    rating?: number;
    semester?: string;
    academicYear?: string;
    content?: string;
}

export class CourseCartItemInput {
    studyProgram: string;
    academicYear: string;
    courseNo: string;
    semester: string;
    selectedSectionNo: string;
    isHidden: boolean;
    color?: string;
}

export abstract class IQuery {
    abstract recommendCourses(selectedCourses: CourseEntryInput[]): CourseEntry[] | Promise<CourseEntry[]>;

    abstract courseNos(): CourseNosOutput | Promise<CourseNosOutput>;

    abstract course(courseNo: string, courseGroup: CourseGroupInput): Course | Promise<Course>;

    abstract search(filter: FilterInput, courseGroup: CourseGroupInput): Course[] | Promise<Course[]>;

    abstract reviews(courseNo: string, studyProgram: StudyProgram): Review[] | Promise<Review[]>;

    abstract myPendingReviews(courseNo: string, studyProgram: StudyProgram): Review[] | Promise<Review[]>;

    abstract pendingReviews(): Review[] | Promise<Review[]>;

    abstract me(): User | Promise<User>;

    abstract courseCart(): CourseCartItem[] | Promise<CourseCartItem[]>;

    abstract calendarId(): string | Promise<string>;
}

export class CourseEntry {
    courseId: string;
    studyProgram: string;
}

export class Period {
    start: string;
    end: string;
}

export class ExamPeriod {
    date: string;
    period: Period;
}

export class Capacity {
    current: number;
    max: number;
}

export class Class {
    type: string;
    dayOfWeek?: DayOfWeek;
    period?: Period;
    building?: string;
    room?: string;
    teachers: string[];
}

export class Section {
    sectionNo: string;
    closed: boolean;
    capacity: Capacity;
    note?: string;
    classes: Class[];
    genEdType: GenEdType;
}

export class Course {
    studyProgram: StudyProgram;
    semester: string;
    academicYear: string;
    courseNo: string;
    courseDesc?: string;
    abbrName: string;
    courseNameTh: string;
    courseNameEn: string;
    faculty: string;
    department: string;
    credit: number;
    creditHours: string;
    courseCondition: string;
    genEdType: GenEdType;
    midterm?: ExamPeriod;
    final?: ExamPeriod;
    sections: Section[];
    rating?: string;
}

export class CourseNosOutput {
    S: string[];
    T: string[];
    I: string[];
}

export abstract class IMutation {
    abstract refresh(): string | Promise<string>;

    abstract createOrUpdateOverride(override: OverrideInput): Override | Promise<Override>;

    abstract deleteOverride(courseNo: string, studyProgram: StudyProgram): Override | Promise<Override>;

    abstract createReview(createReviewInput: CreateReviewInput): Review | Promise<Review>;

    abstract removeReview(reviewId: string): Review | Promise<Review>;

    abstract editMyPendingReview(reviewId: string, review: EditReviewInput): Review | Promise<Review>;

    abstract setInteraction(reviewId: string, interaction: Interaction): Review | Promise<Review>;

    abstract setReviewStatus(reviewId: string, status: Status): string | Promise<string>;

    abstract modifyCourseCart(newContent: CourseCartItemInput[]): CourseCartItem[] | Promise<CourseCartItem[]>;

    abstract modifyCalendarId(newCalendarId?: string): string | Promise<string>;
}

export class GenEdOverride {
    genEdType: GenEdType;
    sections: string[];
}

export class Override {
    courseNo: string;
    studyProgram: StudyProgram;
    courseDesc?: string;
    genEd?: GenEdOverride;
}

export class Review {
    _id: string;
    rating: number;
    courseNo: string;
    semester: string;
    academicYear: string;
    studyProgram: StudyProgram;
    content?: string;
    likeCount: number;
    dislikeCount: number;
    myInteraction?: Interaction;
}

export class GoogleCredential {
    accessToken?: string;
    expiresIn?: Date;
}

export class User {
    _id: string;
    name: string;
}

export class CourseCartItem {
    studyProgram: string;
    academicYear: string;
    courseNo: string;
    semester: string;
    selectedSectionNo: string;
    isHidden: boolean;
    color?: string;
}

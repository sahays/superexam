// This is a generated file - do not edit.
//
// Generated from history.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_relative_imports

import 'dart:core' as $core;

import 'package:fixnum/fixnum.dart' as $fixnum;
import 'package:protobuf/protobuf.dart' as $pb;

export 'package:protobuf/protobuf.dart' show GeneratedMessageGenericExtensions;

class ListExamsRequest extends $pb.GeneratedMessage {
  factory ListExamsRequest({
    $core.int? pageSize,
    $core.String? pageToken,
  }) {
    final result = create();
    if (pageSize != null) result.pageSize = pageSize;
    if (pageToken != null) result.pageToken = pageToken;
    return result;
  }

  ListExamsRequest._();

  factory ListExamsRequest.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory ListExamsRequest.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'ListExamsRequest',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.history'),
      createEmptyInstance: create)
    ..aI(1, _omitFieldNames ? '' : 'pageSize')
    ..aOS(2, _omitFieldNames ? '' : 'pageToken')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ListExamsRequest clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ListExamsRequest copyWith(void Function(ListExamsRequest) updates) =>
      super.copyWith((message) => updates(message as ListExamsRequest))
          as ListExamsRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ListExamsRequest create() => ListExamsRequest._();
  @$core.override
  ListExamsRequest createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static ListExamsRequest getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<ListExamsRequest>(create);
  static ListExamsRequest? _defaultInstance;

  @$pb.TagNumber(1)
  $core.int get pageSize => $_getIZ(0);
  @$pb.TagNumber(1)
  set pageSize($core.int value) => $_setSignedInt32(0, value);
  @$pb.TagNumber(1)
  $core.bool hasPageSize() => $_has(0);
  @$pb.TagNumber(1)
  void clearPageSize() => $_clearField(1);

  @$pb.TagNumber(2)
  $core.String get pageToken => $_getSZ(1);
  @$pb.TagNumber(2)
  set pageToken($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasPageToken() => $_has(1);
  @$pb.TagNumber(2)
  void clearPageToken() => $_clearField(2);
}

class ExamList extends $pb.GeneratedMessage {
  factory ExamList({
    $core.Iterable<ExamSummary>? exams,
    $core.String? nextPageToken,
  }) {
    final result = create();
    if (exams != null) result.exams.addAll(exams);
    if (nextPageToken != null) result.nextPageToken = nextPageToken;
    return result;
  }

  ExamList._();

  factory ExamList.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory ExamList.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'ExamList',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.history'),
      createEmptyInstance: create)
    ..pPM<ExamSummary>(1, _omitFieldNames ? '' : 'exams',
        subBuilder: ExamSummary.create)
    ..aOS(2, _omitFieldNames ? '' : 'nextPageToken')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamList clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamList copyWith(void Function(ExamList) updates) =>
      super.copyWith((message) => updates(message as ExamList)) as ExamList;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ExamList create() => ExamList._();
  @$core.override
  ExamList createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static ExamList getDefault() =>
      _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<ExamList>(create);
  static ExamList? _defaultInstance;

  @$pb.TagNumber(1)
  $pb.PbList<ExamSummary> get exams => $_getList(0);

  @$pb.TagNumber(2)
  $core.String get nextPageToken => $_getSZ(1);
  @$pb.TagNumber(2)
  set nextPageToken($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasNextPageToken() => $_has(1);
  @$pb.TagNumber(2)
  void clearNextPageToken() => $_clearField(2);
}

class ExamSummary extends $pb.GeneratedMessage {
  factory ExamSummary({
    $core.String? examId,
    $fixnum.Int64? timestamp,
    $core.int? score,
    $core.int? totalQuestions,
  }) {
    final result = create();
    if (examId != null) result.examId = examId;
    if (timestamp != null) result.timestamp = timestamp;
    if (score != null) result.score = score;
    if (totalQuestions != null) result.totalQuestions = totalQuestions;
    return result;
  }

  ExamSummary._();

  factory ExamSummary.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory ExamSummary.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'ExamSummary',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.history'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'examId')
    ..aInt64(2, _omitFieldNames ? '' : 'timestamp')
    ..aI(3, _omitFieldNames ? '' : 'score')
    ..aI(4, _omitFieldNames ? '' : 'totalQuestions')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamSummary clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamSummary copyWith(void Function(ExamSummary) updates) =>
      super.copyWith((message) => updates(message as ExamSummary))
          as ExamSummary;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ExamSummary create() => ExamSummary._();
  @$core.override
  ExamSummary createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static ExamSummary getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<ExamSummary>(create);
  static ExamSummary? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get examId => $_getSZ(0);
  @$pb.TagNumber(1)
  set examId($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasExamId() => $_has(0);
  @$pb.TagNumber(1)
  void clearExamId() => $_clearField(1);

  @$pb.TagNumber(2)
  $fixnum.Int64 get timestamp => $_getI64(1);
  @$pb.TagNumber(2)
  set timestamp($fixnum.Int64 value) => $_setInt64(1, value);
  @$pb.TagNumber(2)
  $core.bool hasTimestamp() => $_has(1);
  @$pb.TagNumber(2)
  void clearTimestamp() => $_clearField(2);

  @$pb.TagNumber(3)
  $core.int get score => $_getIZ(2);
  @$pb.TagNumber(3)
  set score($core.int value) => $_setSignedInt32(2, value);
  @$pb.TagNumber(3)
  $core.bool hasScore() => $_has(2);
  @$pb.TagNumber(3)
  void clearScore() => $_clearField(3);

  @$pb.TagNumber(4)
  $core.int get totalQuestions => $_getIZ(3);
  @$pb.TagNumber(4)
  set totalQuestions($core.int value) => $_setSignedInt32(3, value);
  @$pb.TagNumber(4)
  $core.bool hasTotalQuestions() => $_has(3);
  @$pb.TagNumber(4)
  void clearTotalQuestions() => $_clearField(4);
}

class GetExamDetailsRequest extends $pb.GeneratedMessage {
  factory GetExamDetailsRequest({
    $core.String? examId,
  }) {
    final result = create();
    if (examId != null) result.examId = examId;
    return result;
  }

  GetExamDetailsRequest._();

  factory GetExamDetailsRequest.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory GetExamDetailsRequest.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'GetExamDetailsRequest',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.history'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'examId')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  GetExamDetailsRequest clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  GetExamDetailsRequest copyWith(
          void Function(GetExamDetailsRequest) updates) =>
      super.copyWith((message) => updates(message as GetExamDetailsRequest))
          as GetExamDetailsRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static GetExamDetailsRequest create() => GetExamDetailsRequest._();
  @$core.override
  GetExamDetailsRequest createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static GetExamDetailsRequest getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<GetExamDetailsRequest>(create);
  static GetExamDetailsRequest? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get examId => $_getSZ(0);
  @$pb.TagNumber(1)
  set examId($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasExamId() => $_has(0);
  @$pb.TagNumber(1)
  void clearExamId() => $_clearField(1);
}

class ExamDetails extends $pb.GeneratedMessage {
  factory ExamDetails({
    ExamSummary? summary,
    $core.Iterable<QuestionResult>? questions,
  }) {
    final result = create();
    if (summary != null) result.summary = summary;
    if (questions != null) result.questions.addAll(questions);
    return result;
  }

  ExamDetails._();

  factory ExamDetails.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory ExamDetails.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'ExamDetails',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.history'),
      createEmptyInstance: create)
    ..aOM<ExamSummary>(1, _omitFieldNames ? '' : 'summary',
        subBuilder: ExamSummary.create)
    ..pPM<QuestionResult>(2, _omitFieldNames ? '' : 'questions',
        subBuilder: QuestionResult.create)
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamDetails clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamDetails copyWith(void Function(ExamDetails) updates) =>
      super.copyWith((message) => updates(message as ExamDetails))
          as ExamDetails;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ExamDetails create() => ExamDetails._();
  @$core.override
  ExamDetails createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static ExamDetails getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<ExamDetails>(create);
  static ExamDetails? _defaultInstance;

  @$pb.TagNumber(1)
  ExamSummary get summary => $_getN(0);
  @$pb.TagNumber(1)
  set summary(ExamSummary value) => $_setField(1, value);
  @$pb.TagNumber(1)
  $core.bool hasSummary() => $_has(0);
  @$pb.TagNumber(1)
  void clearSummary() => $_clearField(1);
  @$pb.TagNumber(1)
  ExamSummary ensureSummary() => $_ensure(0);

  @$pb.TagNumber(2)
  $pb.PbList<QuestionResult> get questions => $_getList(1);
}

class QuestionResult extends $pb.GeneratedMessage {
  factory QuestionResult({
    $core.String? questionId,
    $core.String? questionText,
    $core.Iterable<$core.String>? userChoiceIds,
    $core.Iterable<$core.String>? correctChoiceIds,
    $core.String? explanation,
  }) {
    final result = create();
    if (questionId != null) result.questionId = questionId;
    if (questionText != null) result.questionText = questionText;
    if (userChoiceIds != null) result.userChoiceIds.addAll(userChoiceIds);
    if (correctChoiceIds != null)
      result.correctChoiceIds.addAll(correctChoiceIds);
    if (explanation != null) result.explanation = explanation;
    return result;
  }

  QuestionResult._();

  factory QuestionResult.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory QuestionResult.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'QuestionResult',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.history'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'questionId')
    ..aOS(2, _omitFieldNames ? '' : 'questionText')
    ..pPS(3, _omitFieldNames ? '' : 'userChoiceIds')
    ..pPS(4, _omitFieldNames ? '' : 'correctChoiceIds')
    ..aOS(5, _omitFieldNames ? '' : 'explanation')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  QuestionResult clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  QuestionResult copyWith(void Function(QuestionResult) updates) =>
      super.copyWith((message) => updates(message as QuestionResult))
          as QuestionResult;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static QuestionResult create() => QuestionResult._();
  @$core.override
  QuestionResult createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static QuestionResult getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<QuestionResult>(create);
  static QuestionResult? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get questionId => $_getSZ(0);
  @$pb.TagNumber(1)
  set questionId($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasQuestionId() => $_has(0);
  @$pb.TagNumber(1)
  void clearQuestionId() => $_clearField(1);

  @$pb.TagNumber(2)
  $core.String get questionText => $_getSZ(1);
  @$pb.TagNumber(2)
  set questionText($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasQuestionText() => $_has(1);
  @$pb.TagNumber(2)
  void clearQuestionText() => $_clearField(2);

  @$pb.TagNumber(3)
  $pb.PbList<$core.String> get userChoiceIds => $_getList(2);

  @$pb.TagNumber(4)
  $pb.PbList<$core.String> get correctChoiceIds => $_getList(3);

  @$pb.TagNumber(5)
  $core.String get explanation => $_getSZ(4);
  @$pb.TagNumber(5)
  set explanation($core.String value) => $_setString(4, value);
  @$pb.TagNumber(5)
  $core.bool hasExplanation() => $_has(4);
  @$pb.TagNumber(5)
  void clearExplanation() => $_clearField(5);
}

const $core.bool _omitFieldNames =
    $core.bool.fromEnvironment('protobuf.omit_field_names');
const $core.bool _omitMessageNames =
    $core.bool.fromEnvironment('protobuf.omit_message_names');

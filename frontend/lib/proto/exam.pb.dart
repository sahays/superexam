// This is a generated file - do not edit.
//
// Generated from exam.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_relative_imports

import 'dart:core' as $core;

import 'package:protobuf/protobuf.dart' as $pb;

export 'package:protobuf/protobuf.dart' show GeneratedMessageGenericExtensions;

class Empty extends $pb.GeneratedMessage {
  factory Empty() => create();

  Empty._();

  factory Empty.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory Empty.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'Empty',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'superexam.exam'),
      createEmptyInstance: create)
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  Empty clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  Empty copyWith(void Function(Empty) updates) =>
      super.copyWith((message) => updates(message as Empty)) as Empty;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static Empty create() => Empty._();
  @$core.override
  Empty createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static Empty getDefault() =>
      _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<Empty>(create);
  static Empty? _defaultInstance;
}

class CountResponse extends $pb.GeneratedMessage {
  factory CountResponse({
    $core.int? count,
  }) {
    final result = create();
    if (count != null) result.count = count;
    return result;
  }

  CountResponse._();

  factory CountResponse.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory CountResponse.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'CountResponse',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'superexam.exam'),
      createEmptyInstance: create)
    ..aI(1, _omitFieldNames ? '' : 'count')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  CountResponse clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  CountResponse copyWith(void Function(CountResponse) updates) =>
      super.copyWith((message) => updates(message as CountResponse))
          as CountResponse;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static CountResponse create() => CountResponse._();
  @$core.override
  CountResponse createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static CountResponse getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<CountResponse>(create);
  static CountResponse? _defaultInstance;

  @$pb.TagNumber(1)
  $core.int get count => $_getIZ(0);
  @$pb.TagNumber(1)
  set count($core.int value) => $_setSignedInt32(0, value);
  @$pb.TagNumber(1)
  $core.bool hasCount() => $_has(0);
  @$pb.TagNumber(1)
  void clearCount() => $_clearField(1);
}

class CreateExamRequest extends $pb.GeneratedMessage {
  factory CreateExamRequest({
    $core.int? questionCount,
  }) {
    final result = create();
    if (questionCount != null) result.questionCount = questionCount;
    return result;
  }

  CreateExamRequest._();

  factory CreateExamRequest.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory CreateExamRequest.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'CreateExamRequest',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'superexam.exam'),
      createEmptyInstance: create)
    ..aI(1, _omitFieldNames ? '' : 'questionCount')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  CreateExamRequest clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  CreateExamRequest copyWith(void Function(CreateExamRequest) updates) =>
      super.copyWith((message) => updates(message as CreateExamRequest))
          as CreateExamRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static CreateExamRequest create() => CreateExamRequest._();
  @$core.override
  CreateExamRequest createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static CreateExamRequest getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<CreateExamRequest>(create);
  static CreateExamRequest? _defaultInstance;

  @$pb.TagNumber(1)
  $core.int get questionCount => $_getIZ(0);
  @$pb.TagNumber(1)
  set questionCount($core.int value) => $_setSignedInt32(0, value);
  @$pb.TagNumber(1)
  $core.bool hasQuestionCount() => $_has(0);
  @$pb.TagNumber(1)
  void clearQuestionCount() => $_clearField(1);
}

class ExamSession extends $pb.GeneratedMessage {
  factory ExamSession({
    $core.String? examId,
    $core.Iterable<Question>? questions,
    $core.int? durationSeconds,
  }) {
    final result = create();
    if (examId != null) result.examId = examId;
    if (questions != null) result.questions.addAll(questions);
    if (durationSeconds != null) result.durationSeconds = durationSeconds;
    return result;
  }

  ExamSession._();

  factory ExamSession.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory ExamSession.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'ExamSession',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'superexam.exam'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'examId')
    ..pPM<Question>(2, _omitFieldNames ? '' : 'questions',
        subBuilder: Question.create)
    ..aI(3, _omitFieldNames ? '' : 'durationSeconds')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamSession clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamSession copyWith(void Function(ExamSession) updates) =>
      super.copyWith((message) => updates(message as ExamSession))
          as ExamSession;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ExamSession create() => ExamSession._();
  @$core.override
  ExamSession createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static ExamSession getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<ExamSession>(create);
  static ExamSession? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get examId => $_getSZ(0);
  @$pb.TagNumber(1)
  set examId($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasExamId() => $_has(0);
  @$pb.TagNumber(1)
  void clearExamId() => $_clearField(1);

  @$pb.TagNumber(2)
  $pb.PbList<Question> get questions => $_getList(1);

  @$pb.TagNumber(3)
  $core.int get durationSeconds => $_getIZ(2);
  @$pb.TagNumber(3)
  set durationSeconds($core.int value) => $_setSignedInt32(2, value);
  @$pb.TagNumber(3)
  $core.bool hasDurationSeconds() => $_has(2);
  @$pb.TagNumber(3)
  void clearDurationSeconds() => $_clearField(3);
}

class Question extends $pb.GeneratedMessage {
  factory Question({
    $core.String? id,
    $core.String? text,
    $core.Iterable<Choice>? choices,
    $core.Iterable<$core.String>? imageUrls,
  }) {
    final result = create();
    if (id != null) result.id = id;
    if (text != null) result.text = text;
    if (choices != null) result.choices.addAll(choices);
    if (imageUrls != null) result.imageUrls.addAll(imageUrls);
    return result;
  }

  Question._();

  factory Question.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory Question.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'Question',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'superexam.exam'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'id')
    ..aOS(2, _omitFieldNames ? '' : 'text')
    ..pPM<Choice>(3, _omitFieldNames ? '' : 'choices',
        subBuilder: Choice.create)
    ..pPS(4, _omitFieldNames ? '' : 'imageUrls')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  Question clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  Question copyWith(void Function(Question) updates) =>
      super.copyWith((message) => updates(message as Question)) as Question;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static Question create() => Question._();
  @$core.override
  Question createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static Question getDefault() =>
      _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<Question>(create);
  static Question? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get id => $_getSZ(0);
  @$pb.TagNumber(1)
  set id($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasId() => $_has(0);
  @$pb.TagNumber(1)
  void clearId() => $_clearField(1);

  @$pb.TagNumber(2)
  $core.String get text => $_getSZ(1);
  @$pb.TagNumber(2)
  set text($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasText() => $_has(1);
  @$pb.TagNumber(2)
  void clearText() => $_clearField(2);

  @$pb.TagNumber(3)
  $pb.PbList<Choice> get choices => $_getList(2);

  @$pb.TagNumber(4)
  $pb.PbList<$core.String> get imageUrls => $_getList(3);
}

class Choice extends $pb.GeneratedMessage {
  factory Choice({
    $core.String? id,
    $core.String? text,
  }) {
    final result = create();
    if (id != null) result.id = id;
    if (text != null) result.text = text;
    return result;
  }

  Choice._();

  factory Choice.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory Choice.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'Choice',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'superexam.exam'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'id')
    ..aOS(2, _omitFieldNames ? '' : 'text')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  Choice clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  Choice copyWith(void Function(Choice) updates) =>
      super.copyWith((message) => updates(message as Choice)) as Choice;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static Choice create() => Choice._();
  @$core.override
  Choice createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static Choice getDefault() =>
      _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<Choice>(create);
  static Choice? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get id => $_getSZ(0);
  @$pb.TagNumber(1)
  set id($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasId() => $_has(0);
  @$pb.TagNumber(1)
  void clearId() => $_clearField(1);

  @$pb.TagNumber(2)
  $core.String get text => $_getSZ(1);
  @$pb.TagNumber(2)
  set text($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasText() => $_has(1);
  @$pb.TagNumber(2)
  void clearText() => $_clearField(2);
}

class ExamSubmission extends $pb.GeneratedMessage {
  factory ExamSubmission({
    $core.String? examId,
    $core.Iterable<Answer>? answers,
  }) {
    final result = create();
    if (examId != null) result.examId = examId;
    if (answers != null) result.answers.addAll(answers);
    return result;
  }

  ExamSubmission._();

  factory ExamSubmission.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory ExamSubmission.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'ExamSubmission',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'superexam.exam'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'examId')
    ..pPM<Answer>(2, _omitFieldNames ? '' : 'answers',
        subBuilder: Answer.create)
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamSubmission clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamSubmission copyWith(void Function(ExamSubmission) updates) =>
      super.copyWith((message) => updates(message as ExamSubmission))
          as ExamSubmission;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ExamSubmission create() => ExamSubmission._();
  @$core.override
  ExamSubmission createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static ExamSubmission getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<ExamSubmission>(create);
  static ExamSubmission? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get examId => $_getSZ(0);
  @$pb.TagNumber(1)
  set examId($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasExamId() => $_has(0);
  @$pb.TagNumber(1)
  void clearExamId() => $_clearField(1);

  @$pb.TagNumber(2)
  $pb.PbList<Answer> get answers => $_getList(1);
}

class Answer extends $pb.GeneratedMessage {
  factory Answer({
    $core.String? questionId,
    $core.Iterable<$core.String>? selectedChoiceIds,
  }) {
    final result = create();
    if (questionId != null) result.questionId = questionId;
    if (selectedChoiceIds != null)
      result.selectedChoiceIds.addAll(selectedChoiceIds);
    return result;
  }

  Answer._();

  factory Answer.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory Answer.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'Answer',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'superexam.exam'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'questionId')
    ..pPS(2, _omitFieldNames ? '' : 'selectedChoiceIds')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  Answer clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  Answer copyWith(void Function(Answer) updates) =>
      super.copyWith((message) => updates(message as Answer)) as Answer;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static Answer create() => Answer._();
  @$core.override
  Answer createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static Answer getDefault() =>
      _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<Answer>(create);
  static Answer? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get questionId => $_getSZ(0);
  @$pb.TagNumber(1)
  set questionId($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasQuestionId() => $_has(0);
  @$pb.TagNumber(1)
  void clearQuestionId() => $_clearField(1);

  @$pb.TagNumber(2)
  $pb.PbList<$core.String> get selectedChoiceIds => $_getList(1);
}

class ExamResult extends $pb.GeneratedMessage {
  factory ExamResult({
    $core.String? examId,
    $core.int? score,
    $core.int? totalScore,
    $core.bool? passed,
  }) {
    final result = create();
    if (examId != null) result.examId = examId;
    if (score != null) result.score = score;
    if (totalScore != null) result.totalScore = totalScore;
    if (passed != null) result.passed = passed;
    return result;
  }

  ExamResult._();

  factory ExamResult.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory ExamResult.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'ExamResult',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'superexam.exam'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'examId')
    ..aI(2, _omitFieldNames ? '' : 'score')
    ..aI(3, _omitFieldNames ? '' : 'totalScore')
    ..aOB(4, _omitFieldNames ? '' : 'passed')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamResult clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ExamResult copyWith(void Function(ExamResult) updates) =>
      super.copyWith((message) => updates(message as ExamResult)) as ExamResult;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ExamResult create() => ExamResult._();
  @$core.override
  ExamResult createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static ExamResult getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<ExamResult>(create);
  static ExamResult? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get examId => $_getSZ(0);
  @$pb.TagNumber(1)
  set examId($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasExamId() => $_has(0);
  @$pb.TagNumber(1)
  void clearExamId() => $_clearField(1);

  @$pb.TagNumber(2)
  $core.int get score => $_getIZ(1);
  @$pb.TagNumber(2)
  set score($core.int value) => $_setSignedInt32(1, value);
  @$pb.TagNumber(2)
  $core.bool hasScore() => $_has(1);
  @$pb.TagNumber(2)
  void clearScore() => $_clearField(2);

  @$pb.TagNumber(3)
  $core.int get totalScore => $_getIZ(2);
  @$pb.TagNumber(3)
  set totalScore($core.int value) => $_setSignedInt32(2, value);
  @$pb.TagNumber(3)
  $core.bool hasTotalScore() => $_has(2);
  @$pb.TagNumber(3)
  void clearTotalScore() => $_clearField(3);

  @$pb.TagNumber(4)
  $core.bool get passed => $_getBF(3);
  @$pb.TagNumber(4)
  set passed($core.bool value) => $_setBool(3, value);
  @$pb.TagNumber(4)
  $core.bool hasPassed() => $_has(3);
  @$pb.TagNumber(4)
  void clearPassed() => $_clearField(4);
}

const $core.bool _omitFieldNames =
    $core.bool.fromEnvironment('protobuf.omit_field_names');
const $core.bool _omitMessageNames =
    $core.bool.fromEnvironment('protobuf.omit_message_names');

// This is a generated file - do not edit.
//
// Generated from history.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_relative_imports
// ignore_for_file: unused_import

import 'dart:convert' as $convert;
import 'dart:core' as $core;
import 'dart:typed_data' as $typed_data;

@$core.Deprecated('Use listExamsRequestDescriptor instead')
const ListExamsRequest$json = {
  '1': 'ListExamsRequest',
  '2': [
    {'1': 'page_size', '3': 1, '4': 1, '5': 5, '10': 'pageSize'},
    {'1': 'page_token', '3': 2, '4': 1, '5': 9, '10': 'pageToken'},
  ],
};

/// Descriptor for `ListExamsRequest`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List listExamsRequestDescriptor = $convert.base64Decode(
    'ChBMaXN0RXhhbXNSZXF1ZXN0EhsKCXBhZ2Vfc2l6ZRgBIAEoBVIIcGFnZVNpemUSHQoKcGFnZV'
    '90b2tlbhgCIAEoCVIJcGFnZVRva2Vu');

@$core.Deprecated('Use examListDescriptor instead')
const ExamList$json = {
  '1': 'ExamList',
  '2': [
    {
      '1': 'exams',
      '3': 1,
      '4': 3,
      '5': 11,
      '6': '.superexam.history.ExamSummary',
      '10': 'exams'
    },
    {'1': 'next_page_token', '3': 2, '4': 1, '5': 9, '10': 'nextPageToken'},
  ],
};

/// Descriptor for `ExamList`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List examListDescriptor = $convert.base64Decode(
    'CghFeGFtTGlzdBI0CgVleGFtcxgBIAMoCzIeLnN1cGVyZXhhbS5oaXN0b3J5LkV4YW1TdW1tYX'
    'J5UgVleGFtcxImCg9uZXh0X3BhZ2VfdG9rZW4YAiABKAlSDW5leHRQYWdlVG9rZW4=');

@$core.Deprecated('Use examSummaryDescriptor instead')
const ExamSummary$json = {
  '1': 'ExamSummary',
  '2': [
    {'1': 'exam_id', '3': 1, '4': 1, '5': 9, '10': 'examId'},
    {'1': 'timestamp', '3': 2, '4': 1, '5': 3, '10': 'timestamp'},
    {'1': 'score', '3': 3, '4': 1, '5': 5, '10': 'score'},
    {'1': 'total_questions', '3': 4, '4': 1, '5': 5, '10': 'totalQuestions'},
  ],
};

/// Descriptor for `ExamSummary`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List examSummaryDescriptor = $convert.base64Decode(
    'CgtFeGFtU3VtbWFyeRIXCgdleGFtX2lkGAEgASgJUgZleGFtSWQSHAoJdGltZXN0YW1wGAIgAS'
    'gDUgl0aW1lc3RhbXASFAoFc2NvcmUYAyABKAVSBXNjb3JlEicKD3RvdGFsX3F1ZXN0aW9ucxgE'
    'IAEoBVIOdG90YWxRdWVzdGlvbnM=');

@$core.Deprecated('Use getExamDetailsRequestDescriptor instead')
const GetExamDetailsRequest$json = {
  '1': 'GetExamDetailsRequest',
  '2': [
    {'1': 'exam_id', '3': 1, '4': 1, '5': 9, '10': 'examId'},
  ],
};

/// Descriptor for `GetExamDetailsRequest`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List getExamDetailsRequestDescriptor =
    $convert.base64Decode(
        'ChVHZXRFeGFtRGV0YWlsc1JlcXVlc3QSFwoHZXhhbV9pZBgBIAEoCVIGZXhhbUlk');

@$core.Deprecated('Use examDetailsDescriptor instead')
const ExamDetails$json = {
  '1': 'ExamDetails',
  '2': [
    {
      '1': 'summary',
      '3': 1,
      '4': 1,
      '5': 11,
      '6': '.superexam.history.ExamSummary',
      '10': 'summary'
    },
    {
      '1': 'questions',
      '3': 2,
      '4': 3,
      '5': 11,
      '6': '.superexam.history.QuestionResult',
      '10': 'questions'
    },
  ],
};

/// Descriptor for `ExamDetails`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List examDetailsDescriptor = $convert.base64Decode(
    'CgtFeGFtRGV0YWlscxI4CgdzdW1tYXJ5GAEgASgLMh4uc3VwZXJleGFtLmhpc3RvcnkuRXhhbV'
    'N1bW1hcnlSB3N1bW1hcnkSPwoJcXVlc3Rpb25zGAIgAygLMiEuc3VwZXJleGFtLmhpc3Rvcnku'
    'UXVlc3Rpb25SZXN1bHRSCXF1ZXN0aW9ucw==');

@$core.Deprecated('Use questionResultDescriptor instead')
const QuestionResult$json = {
  '1': 'QuestionResult',
  '2': [
    {'1': 'question_id', '3': 1, '4': 1, '5': 9, '10': 'questionId'},
    {'1': 'question_text', '3': 2, '4': 1, '5': 9, '10': 'questionText'},
    {'1': 'user_choice_ids', '3': 3, '4': 3, '5': 9, '10': 'userChoiceIds'},
    {
      '1': 'correct_choice_ids',
      '3': 4,
      '4': 3,
      '5': 9,
      '10': 'correctChoiceIds'
    },
    {'1': 'explanation', '3': 5, '4': 1, '5': 9, '10': 'explanation'},
  ],
};

/// Descriptor for `QuestionResult`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List questionResultDescriptor = $convert.base64Decode(
    'Cg5RdWVzdGlvblJlc3VsdBIfCgtxdWVzdGlvbl9pZBgBIAEoCVIKcXVlc3Rpb25JZBIjCg1xdW'
    'VzdGlvbl90ZXh0GAIgASgJUgxxdWVzdGlvblRleHQSJgoPdXNlcl9jaG9pY2VfaWRzGAMgAygJ'
    'Ug11c2VyQ2hvaWNlSWRzEiwKEmNvcnJlY3RfY2hvaWNlX2lkcxgEIAMoCVIQY29ycmVjdENob2'
    'ljZUlkcxIgCgtleHBsYW5hdGlvbhgFIAEoCVILZXhwbGFuYXRpb24=');

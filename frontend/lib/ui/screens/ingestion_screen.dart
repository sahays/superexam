import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:frontend/services/ingestion_service.dart';
import 'package:frontend/proto/ingestion.pb.dart' as proto;
import 'dart:typed_data';

class IngestionScreen extends StatefulWidget {
  const IngestionScreen({super.key});

  @override
  State<IngestionScreen> createState() => _IngestionScreenState();
}

class _IngestionScreenState extends State<IngestionScreen> with SingleTickerProviderStateMixin {
  final _promptController = TextEditingController();
  final _ingestionService = IngestionService();
  
  String? _selectedFileName;
  Uint8List? _selectedFileData;
  
  List<proto.IngestionStatus> _logs = [];
  bool _isUploading = false;
  double _progress = 0.0;
  
  late AnimationController _animController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _promptController.dispose();
    _ingestionService.shutdown();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      withData: true,
    );

    if (result != null) {
      setState(() {
        _selectedFileName = result.files.single.name;
        _selectedFileData = result.files.single.bytes;
      });
    }
  }

  Future<void> _startUpload() async {
    if (_selectedFileData == null) return;

    setState(() {
      _isUploading = true;
      _logs.clear();
      _progress = 0.0;
    });

    try {
      final stream = _ingestionService.uploadPdf(
        _selectedFileName!,
        _selectedFileData!,
        _promptController.text,
      );

      await for (var status in stream) {
        setState(() {
          _logs.add(status);
          _progress = status.progressPercent / 100.0;
        });
        
        if (status.state == proto.IngestionStatus_State.COMPLETED) {
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(
               content: Text('Processing Complete! ID: ${status.documentId}'),
               backgroundColor: const Color(0xFF22C55E),
             ),
           );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Colors from Design Spec
    const bgColor = Color(0xFFF0F4F8);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryBlue = Color(0xFF3B82F6);

    return Scaffold(
      backgroundColor: bgColor,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(
          'Exam Ingestion', 
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w700, 
            color: textPrimary
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Stack(
        children: [
          // Background Gradient Orbs (Subtle decoration for glassmorphism)
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [const Color(0xFFA78BFA).withOpacity(0.3), const Color(0xFF8B5CF6).withOpacity(0.3)],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [const Color(0xFFFDBA74).withOpacity(0.3), const Color(0xFFF87171).withOpacity(0.3)],
                ),
              ),
            ),
          ),
          
          // Main Content
          Center(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: Container(
                      width: 600,
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white.withOpacity(0.5)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            'Upload Exam Document',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Upload a PDF to parse questions and answers automatically.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              fontSize: 16,
                              color: textSecondary,
                            ),
                          ),
                          const SizedBox(height: 32),
                          
                          // File Picker Area
                          InkWell(
                            onTap: _pickFile,
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              height: 180,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.5),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: _selectedFileName != null ? primaryBlue : Colors.grey.shade300,
                                  width: 2,
                                  style: BorderStyle.none, // Can't do dashed easily without CustomPaint, using solid for now but styled
                                ),
                              ),
                              child: CustomPaint(
                                painter: DashedBorderPainter(
                                  color: _selectedFileName != null ? primaryBlue : Colors.grey.shade400,
                                  strokeWidth: 2,
                                  gap: 8,
                                ),
                                child: Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        _selectedFileName != null ? Icons.check_circle : Icons.cloud_upload_rounded,
                                        size: 48,
                                        color: _selectedFileName != null ? primaryBlue : textSecondary,
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        _selectedFileName ?? 'Click to browse or drop file here',
                                        style: GoogleFonts.inter(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                          color: textPrimary,
                                        ),
                                      ),
                                      if (_selectedFileName == null)
                                        Padding(
                                          padding: const EdgeInsets.only(top: 8),
                                          child: Text(
                                            'PDF files only',
                                            style: GoogleFonts.inter(fontSize: 12, color: textSecondary),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          
                          const SizedBox(height: 24),
                          
                          // User Prompt
                          TextField(
                            controller: _promptController,
                            maxLines: 3,
                            style: GoogleFonts.inter(color: textPrimary),
                            decoration: InputDecoration(
                              labelText: 'Custom Parsing Instructions (Optional)',
                              hintText: 'e.g., "Ignore the first section", "Extract only multiple choice"',
                              labelStyle: GoogleFonts.inter(color: textSecondary),
                              hintStyle: GoogleFonts.inter(color: textSecondary.withOpacity(0.7)),
                              filled: true,
                              fillColor: Colors.white.withOpacity(0.5),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: Colors.grey.shade200),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: primaryBlue),
                              ),
                            ),
                          ),
                          
                          const SizedBox(height: 32),
                          
                          // Progress Section
                          if (_isUploading) ...[
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Processing...',
                                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: textPrimary),
                                    ),
                                    Text(
                                      '${(_progress * 100).toInt()}%',
                                      style: GoogleFonts.inter(fontSize: 14, color: textSecondary),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(4),
                                  child: LinearProgressIndicator(
                                    value: _progress,
                                    backgroundColor: Colors.grey.shade200,
                                    valueColor: const AlwaysStoppedAnimation<Color>(primaryBlue),
                                    minHeight: 8,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _logs.isNotEmpty ? _logs.last.message : 'Initializing...',
                                  style: GoogleFonts.inter(fontSize: 13, color: textSecondary),
                                ),
                              ],
                            ),
                          ] else
                            // Action Button
                            Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                gradient: const LinearGradient(
                                  colors: [Color(0xFFA78BFA), Color(0xFF8B5CF6)], // Purple Gradient
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF8B5CF6).withOpacity(0.4),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ElevatedButton(
                                onPressed: _selectedFileData == null ? null : _startUpload,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  padding: const EdgeInsets.symmetric(vertical: 18),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                child: Text(
                                  'Process Document',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Simple Painter for dashed border
class DashedBorderPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;
  final double gap;

  DashedBorderPainter({required this.color, this.strokeWidth = 2, this.gap = 5.0});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final Path path = Path()
      ..addRRect(RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, size.width, size.height),
        const Radius.circular(16),
      ));

    final Path dashedPath = Path();
    double distance = 0.0;
    for (final PathMetric metric in path.computeMetrics()) {
      while (distance < metric.length) {
        dashedPath.addPath(
          metric.extractPath(distance, distance + 10), // Dash length 10
          Offset.zero,
        );
        distance += 10 + gap;
      }
    }

    canvas.drawPath(dashedPath, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}


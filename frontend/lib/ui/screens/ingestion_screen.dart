import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:frontend/services/ingestion_service.dart';
import 'package:frontend/proto/ingestion.pb.dart' as proto;
import 'package:frontend/ui/common/ui_painters.dart'; // Import shared painters
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

  // Hover state for the main button
  bool _isButtonHovered = false;

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
    // 1. Detect Theme Mode
    final brightness = MediaQuery.of(context).platformBrightness;
    final isDark = brightness == Brightness.dark;

    // 2. Define Palettes
    final cardDark = const Color(0xFF151725);
    final borderDark = const Color(0xFFFFFFFF).withOpacity(0.12);
    final textPrimaryDark = const Color(0xFFFFFFFF);
    final textSecondaryDark = const Color(0xFF9CA3AF);
    final accentDark = const Color(0xFF3B82F6);
    
    final cardLight = const Color(0xFFFFFFFF);
    final borderLight = const Color(0xFFFFFFFF);
    final textPrimaryLight = const Color(0xFF1F2937);
    final textSecondaryLight = const Color(0xFF64748B);
    final accentLight = const Color(0xFF2563EB);

    final cardColor = isDark ? cardDark : cardLight;
    final borderColor = isDark ? borderDark : borderLight;
    final textPrimary = isDark ? textPrimaryDark : textPrimaryLight;
    final textSecondary = isDark ? textSecondaryDark : textSecondaryLight;
    final accentColor = isDark ? accentDark : accentLight;
    
    final isMobile = MediaQuery.of(context).size.width < 600;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: Center(
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 600), // Responsive width
              padding: EdgeInsets.all(isMobile ? 24 : 40),
              decoration: BoxDecoration(
                color: isDark ? cardColor.withOpacity(0.65) : cardColor.withOpacity(0.6),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: isDark ? borderColor : Colors.white.withOpacity(0.8), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withOpacity(0.4) : const Color(0xFF3B82F6).withOpacity(0.1),
                    blurRadius: 40,
                    offset: const Offset(0, 20),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Upload Document',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Upload a PDF to parse questions and answers automatically.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      color: textSecondary,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 40),
                  
                  // File Picker (Drop Zone)
                  InkWell(
                    onTap: _pickFile,
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      height: 220,
                      decoration: BoxDecoration(
                        color: isDark ? Colors.black.withOpacity(0.3) : Colors.white.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _selectedFileName != null ? accentColor : (isDark ? Colors.white10 : Colors.grey.shade300),
                          width: 2,
                          style: BorderStyle.none, 
                        ),
                      ),
                      child: CustomPaint(
                        painter: DashedBorderPainter(
                          color: _selectedFileName != null ? accentColor : (isDark ? Colors.white24 : Colors.grey.shade400),
                          strokeWidth: 2,
                          gap: 8,
                          radius: 20,
                        ),
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _selectedFileName != null 
                                      ? accentColor.withOpacity(0.15) 
                                      : (isDark ? Colors.white.withOpacity(0.05) : Colors.grey.shade100),
                                  boxShadow: _selectedFileName != null ? [
                                    BoxShadow(
                                      color: accentColor.withOpacity(0.5),
                                      blurRadius: 25,
                                      spreadRadius: 2,
                                    )
                                  ] : [],
                                ),
                                child: Icon(
                                  _selectedFileName != null ? Icons.check_rounded : Icons.cloud_upload_rounded,
                                  size: 40,
                                  color: _selectedFileName != null ? accentColor : textSecondary,
                                ),
                              ),
                              const SizedBox(height: 20),
                              Text(
                                _selectedFileName ?? 'Click to browse',
                                style: GoogleFonts.inter(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  color: textPrimary,
                                ),
                              ),
                              if (_selectedFileName == null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Text(
                                    'Max size 10MB',
                                    style: GoogleFonts.inter(fontSize: 14, color: textSecondary.withOpacity(0.7)),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Input
                  TextField(
                    controller: _promptController,
                    maxLines: 3,
                    style: GoogleFonts.inter(color: textPrimary),
                    cursorColor: accentColor,
                    decoration: InputDecoration(
                      labelText: 'Custom Instructions (Optional)',
                      hintText: 'e.g., "Focus on chapter 3 questions"',
                      labelStyle: GoogleFonts.inter(color: textSecondary),
                      hintStyle: GoogleFonts.inter(color: textSecondary.withOpacity(0.5)),
                      filled: true,
                      fillColor: isDark ? Colors.black.withOpacity(0.3) : Colors.white.withOpacity(0.6),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: isDark ? Colors.white10 : Colors.grey.shade200),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: accentColor),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // Progress / Action Button
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
                        const SizedBox(height: 12),
                        // Custom Neon Progress Bar
                        Container(
                          height: 6,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(3),
                            color: isDark ? Colors.white10 : Colors.grey.shade200,
                          ),
                          child: LayoutBuilder(
                            builder: (ctx, constraints) {
                              return Stack(
                                children: [
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    width: constraints.maxWidth * _progress,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(3),
                                      color: accentColor,
                                      boxShadow: [
                                        BoxShadow(
                                          color: accentColor.withOpacity(0.6),
                                          blurRadius: 8,
                                          spreadRadius: 1,
                                        )
                                      ]
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _logs.isNotEmpty ? _logs.last.message : 'Initializing...',
                          style: GoogleFonts.inter(fontSize: 13, color: textSecondary),
                        ),
                      ],
                    ),
                  ] else
                    // Hoverable Action Button
                    MouseRegion(
                      onEnter: (_) => setState(() => _isButtonHovered = true),
                      onExit: (_) => setState(() => _isButtonHovered = false),
                      cursor: SystemMouseCursors.click,
                      child: GestureDetector(
                        onTap: _selectedFileData == null ? null : _startUpload,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          height: 56,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: LinearGradient(
                              colors: isDark 
                                ? [const Color(0xFF3B82F6), const Color(0xFF2563EB)]
                                : [const Color(0xFFA78BFA), const Color(0xFF8B5CF6)],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: (isDark ? const Color(0xFF3B82F6) : const Color(0xFF8B5CF6))
                                    .withOpacity(_isButtonHovered ? 0.6 : 0.4),
                                blurRadius: _isButtonHovered ? 24 : 16,
                                offset: const Offset(0, 4),
                                spreadRadius: _isButtonHovered ? 2 : 0,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.bolt_rounded, color: Colors.white),
                              const SizedBox(width: 8),
                              Text(
                                'Process Document',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
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
    );
  }
}
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:frontend/ui/common/ui_painters.dart';
import 'package:frontend/ui/screens/documents_screen.dart';

class AdminShell extends StatefulWidget {
  final Widget? child; // Deprecated: Navigation handled internally
  final String title;

  const AdminShell({
    super.key, 
    this.child, 
    this.title = 'SuperExam',
  });

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  bool _isSidebarCollapsed = false;
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    const DocumentsScreen(),
    const Center(child: Text("Exams (Coming Soon)")),
    const Center(child: Text("Prompts (Coming Soon)")),
  ];

  final List<String> _titles = [
    'Documents',
    'Exams',
    'Prompts',
  ];

  void _toggleSidebar() {
    setState(() {
      _isSidebarCollapsed = !_isSidebarCollapsed;
    });
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    if (MediaQuery.of(context).size.width < 900) {
      Navigator.pop(context); // Close drawer on mobile
    }
  }

  @override
  Widget build(BuildContext context) {
    // Theme Logic
    final brightness = MediaQuery.of(context).platformBrightness;
    final isDark = brightness == Brightness.dark;
    
    // Palettes
    final textPrimary = isDark ? const Color(0xFFFFFFFF) : const Color(0xFF1F2937);
    final borderColor = isDark ? Colors.white.withOpacity(0.12) : Colors.white.withOpacity(0.8);
    final cardColor = isDark ? const Color(0xFF151725) : const Color(0xFFFFFFFF);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 900;

        return Scaffold(
          key: _scaffoldKey,
          backgroundColor: isDark ? const Color(0xFF0F111A) : const Color(0xFFF0F4F8),
          drawer: isMobile 
            ? Drawer(
                width: 280,
                backgroundColor: Colors.transparent, // We'll handle bg in widget
                child: _buildSidebar(isDark, cardColor, borderColor, textPrimary, isMobile: true),
              )
            : null,
          body: Stack(
            children: [
              // --- BACKGROUND LAYER ---
              _buildBackground(isDark),

              // --- FOREGROUND LAYOUT ---
              Row(
                children: [
                  // 1. SIDEBAR (Desktop Only)
                  if (!isMobile)
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: _isSidebarCollapsed ? 80 : 260,
                      curve: Curves.easeInOut,
                      child: _buildSidebar(isDark, cardColor, borderColor, textPrimary, isMobile: false),
                    ),

                  // 2. MAIN CONTENT AREA
                  Expanded(
                    child: Column(
                      children: [
                        // A. NAVBAR
                        _buildNavbar(isDark, cardColor, borderColor, textPrimary, isMobile),

                        // B. CONTENT BODY
                        Expanded(
                          child: Center(
                            child: ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 1280),
                              child: Padding(
                                padding: EdgeInsets.all(isMobile ? 16.0 : 24.0),
                                child: _pages[_selectedIndex],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      }
    );
  }

  Widget _buildBackground(bool isDark) {
    return Stack(
      children: [
        // Base Gradient
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: isDark 
                ? [const Color(0xFF0F111A), const Color(0xFF1A1D2D)]
                : [const Color(0xFFF0F4F8), const Color(0xFFE2E8F0)],
            ),
          ),
        ),
        // Color Orbs
        Positioned(
          top: -200, left: -100,
          child: Container(
            width: 800, height: 800,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  (isDark ? const Color(0xFF3B82F6) : const Color(0xFFA78BFA)).withOpacity(0.15),
                  Colors.transparent
                ],
                radius: 0.6,
              ),
            ),
          ),
        ),
        Positioned(
          bottom: -200, right: -100,
          child: Container(
            width: 800, height: 800,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  (isDark ? const Color(0xFF8B5CF6) : const Color(0xFFFDBA74)).withOpacity(0.15),
                  Colors.transparent
                ],
                radius: 0.6,
              ),
            ),
          ),
        ),
        // Tech Grid
        Positioned.fill(
          child: CustomPaint(
            painter: GridPatternPainter(
              color: isDark ? Colors.white.withOpacity(0.03) : Colors.black.withOpacity(0.03),
              spacing: 40,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSidebar(bool isDark, Color cardColor, Color borderColor, Color textColor, {required bool isMobile}) {
    // If mobile, force expanded
    final collapsed = isMobile ? false : _isSidebarCollapsed;

    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          decoration: BoxDecoration(
            color: cardColor.withOpacity(isDark ? 0.8 : 0.85), // Higher opacity for legibility
            border: Border(right: BorderSide(color: borderColor)),
          ),
          child: Column(
            children: [
              // Logo Area
              SizedBox(
                height: 80,
                child: Center(
                  child: collapsed
                    ? const Icon(Icons.bolt_rounded, color: Color(0xFF3B82F6), size: 32)
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.bolt_rounded, color: Color(0xFF3B82F6), size: 32),
                          const SizedBox(width: 12),
                          Text(
                            'SuperExam',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                ),
              ),
              const Divider(height: 1, color: Colors.white10),
              const SizedBox(height: 24),
              
              // Navigation Items
              _SidebarItem(
                icon: Icons.description_outlined,
                label: 'Documents',
                isActive: _selectedIndex == 0,
                isCollapsed: collapsed,
                textColor: textColor,
                onTap: () => _onItemTapped(0),
              ),
              _SidebarItem(
                icon: Icons.library_books_outlined,
                label: 'Exams',
                isActive: _selectedIndex == 1,
                isCollapsed: collapsed,
                textColor: textColor,
                onTap: () => _onItemTapped(1),
              ),
              _SidebarItem(
                icon: Icons.lightbulb_outlined,
                label: 'Prompts',
                isActive: _selectedIndex == 2,
                isCollapsed: collapsed,
                textColor: textColor,
                onTap: () => _onItemTapped(2),
              ),
              
              const Spacer(),
              // Footer / Toggle (Only on Desktop)
              if (!isMobile) ...[
                IconButton(
                  icon: Icon(
                    collapsed ? Icons.keyboard_double_arrow_right : Icons.keyboard_double_arrow_left,
                    color: textColor.withOpacity(0.5),
                  ),
                  onPressed: _toggleSidebar,
                ),
                const SizedBox(height: 16),
              ]
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavbar(bool isDark, Color cardColor, Color borderColor, Color textColor, bool isMobile) {
    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          height: 70,
          decoration: BoxDecoration(
            color: cardColor.withOpacity(isDark ? 0.3 : 0.3),
            border: Border(bottom: BorderSide(color: borderColor)),
          ),
          padding: EdgeInsets.symmetric(horizontal: isMobile ? 16 : 32),
          child: Row(
            children: [
              if (isMobile)
                IconButton(
                  icon: Icon(Icons.menu, color: textColor),
                  onPressed: () {
                    _scaffoldKey.currentState?.openDrawer();
                  },
                ),
              if (isMobile) const SizedBox(width: 8),

              Text(
                _titles[_selectedIndex],
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: textColor,
                ),
              ),
              const Spacer(),
              
              // Search Bar (Hidden on Mobile)
              if (!isMobile)
                Container(
                  width: 300,
                  height: 40,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.black.withOpacity(0.2) : Colors.white.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: borderColor),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Icon(Icons.search, size: 20, color: textColor.withOpacity(0.5)),
                      const SizedBox(width: 8),
                      Text(
                        'Search exams...',
                        style: GoogleFonts.inter(color: textColor.withOpacity(0.5)),
                      ),
                    ],
                  ),
                ),
              
              SizedBox(width: isMobile ? 16 : 24),
              // Profile
              CircleAvatar(
                backgroundColor: const Color(0xFF3B82F6),
                radius: 18,
                child: Text('SA', style: GoogleFonts.inter(color: Colors.white, fontSize: 14)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final bool isCollapsed;
  final Color textColor;
  final VoidCallback onTap;

  const _SidebarItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.isCollapsed,
    required this.textColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = const Color(0xFF3B82F6);
    
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 16),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          hoverColor: activeColor.withOpacity(0.1),
          child: Container(
            height: 48,
            padding: EdgeInsets.symmetric(horizontal: isCollapsed ? 0 : 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: isActive ? activeColor.withOpacity(0.15) : Colors.transparent,
              border: isActive ? Border.all(color: activeColor.withOpacity(0.3)) : null,
            ),
            child: Row(
              mainAxisAlignment: isCollapsed ? MainAxisAlignment.center : MainAxisAlignment.start,
              children: [
                Icon(
                  icon,
                  color: isActive ? activeColor : textColor.withOpacity(0.7),
                  size: 22,
                ),
                if (!isCollapsed) ...[
                  const SizedBox(width: 12),
                  Text(
                    label,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                      color: isActive ? activeColor : textColor.withOpacity(0.7),
                    ),
                  ),
                ]
              ],
            ),
          ),
        ),
      ),
    );
  }
}
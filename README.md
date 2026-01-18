# MUT Improv Games Web Application

A responsive web application for browsing and searching the MUT Improv Games database. Built with HTML, CSS, and JavaScript, hosted for free on Render.com.

## Features

- **Search**: Real-time text search across game names, descriptions, rules, tips, and examples
- **Filters**: Filter by category, difficulty level, and other attributes
- **Game Details**: Click any game to view comprehensive information including setup, rules, tips, examples, and video links
- **YouTube Integration**: Embedded YouTube videos for games that have video examples
- **Dark/Light Mode**: Modern theme toggle with Apple-inspired design
- **Responsive Design**: Mobile-friendly interface using Bootstrap 5
- **Fast & Static**: No backend required, all logic runs client-side
- **Modern UI**: Clean, minimalist design with smooth animations and transitions

## Project Structure

```
mutgames-web/
├── index.html          # Main page with game listing and search
├── game.html           # Individual game details page
├── test.html           # Test suite for functionality and accessibility
├── css/
│   ├── style.css       # Custom styles and theming
│   └── bootstrap.min.css # Bootstrap 5 (local copy)
├── js/
│   ├── app.js          # Main application initialization
│   ├── data.js         # Data loading and processing
│   ├── search.js       # Search and filter functionality
│   ├── game-details.js # Game details page logic
│   └── bootstrap.bundle.min.js # Bootstrap 5 JavaScript (local copy)
├── data/
│   └── mutgames.json   # Game database (copied from parent directory)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Setup & Development

### Prerequisites
- Any modern web browser (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- No additional software or dependencies required

### Local Development Setup

1. **Clone or copy the project structure**
   ```bash
   # If using git
   git clone <your-repo-url>
   cd mutgames-web

   # Or manually copy the mutgames-web directory
   ```

2. **Verify data file**: Ensure `mutgames.json` exists in the `data/` directory
   ```bash
   ls -la data/
   # Should show: mutgames.json
   ```

3. **Start local development server** (recommended for proper CORS and relative path handling):
   ```bash
   # Using Python (if available)
   python3 -m http.server 8000

   # Or using Node.js (if available)
   npx serve .

   # Or using PHP (if available)
   php -S localhost:8000

   # Or using Ruby (if available)
   ruby -run -e httpd . -p 8000
   ```

   **To stop the server**: Press `Ctrl+C` in the terminal where it's running

4. **Open in browser**:
   - If using a local server: `http://localhost:8000`
   - Or directly: Double-click `index.html` in your file explorer

5. **Verify functionality**:
   - Page should load with "Loading games..." then display all 232+ games
   - Search bar should work for real-time filtering
   - Filter dropdowns should update results
   - Click any game card to view details
   - Games with YouTube links should show embedded videos

### Alternative: Direct File Opening

For quick testing, you can simply:
1. Navigate to the `mutgames-web` directory
2. Double-click `index.html` to open in your default browser

**Note**: Some browsers may block local file access for security. Using a local server is recommended for full functionality.

### Development Workflow

1. **Make changes** to HTML, CSS, or JavaScript files
2. **Test locally** using one of the methods above
3. **Check browser console** for any JavaScript errors
4. **Test responsiveness** by resizing browser window
5. **Verify search/filter** functionality works as expected

### Debugging Tips

- **Open Developer Tools**: Press F12 or right-click → "Inspect Element"
- **Check Console**: Look for JavaScript errors in the Console tab
- **Network Tab**: Verify `mutgames.json` loads successfully
- **Responsive Testing**: Use browser dev tools device emulation
- **Search Testing**: Try various search terms and filter combinations

### File Structure Explanation

- **`index.html`**: Main application page with search and game grid
- **`game.html`**: Individual game detail pages (loaded dynamically)
- **`test.html`**: Test suite for functionality and accessibility
- **`css/style.css`**: Custom styles and responsive design
- **`js/app.js`**: Main application initialization and error handling
- **`js/data.js`**: Game data loading, processing, and utility functions
- **`js/search.js`**: Search and filter functionality
- **`js/game-details.js`**: Game detail page logic and YouTube embedding
- **`data/mutgames.json`**: Game database (232+ games)

## Testing

The application includes a comprehensive test suite to verify functionality and accessibility.

### Running Tests

1. **Open the test suite**: Navigate to `test.html` in your browser
2. **Run all tests**: Click the "Run All Tests" button
3. **Run accessibility tests**: Click the "Accessibility Tests" button
4. **Review results**: Tests are organized by category with pass/fail indicators

### Test Categories

- **Data Loading Tests**: Verify game data loads correctly and has expected structure
- **Search Functionality Tests**: Test text search, case sensitivity, and result accuracy
- **Filter Functionality Tests**: Test category, difficulty, and combined filtering
- **UI Component Tests**: Verify interface elements are present and functional
- **Accessibility Tests**: Check for proper labels, alt text, and semantic structure

### Manual Testing Checklist

- [ ] Search functionality works with various terms
- [ ] Filters update results correctly
- [ ] Game cards display properly on mobile/desktop
- [ ] Game detail pages load and show complete information
- [ ] YouTube videos embed correctly
- [ ] Dark/light mode toggle works
- [ ] Keyboard navigation functions
- [ ] Screen reader compatibility (use browser dev tools)
- [ ] Color contrast meets WCAG AA standards
- [ ] Responsive design works on different screen sizes

## Deployment

### Render.com (Free)
1. Create a free account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Select "Static Site" as the service type
4. Set the build command to `echo "No build required"`
5. Set the publish directory to `/` (root)
6. Deploy!

### Other Hosting Options
- GitHub Pages (free)
- Netlify (free tier available)
- Vercel (free tier available)
- Any static web host

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Data Source

This application uses the MUT Improv Games database from the parent directory. The database contains 232+ improv games with detailed information including:

- Game names and descriptions
- Player counts and difficulty levels
- Setup instructions and rules
- Tips and examples
- Video links and additional notes

## Customization

### Adding New Games
1. Update `mutgames.json` in the parent directory
2. Copy the updated file to `data/mutgames.json`
3. Redeploy the application

### Styling Changes
- Modify `css/style.css` for custom styling
- Update Bootstrap version in HTML files if needed

### Feature Additions
- Add new JavaScript files in the `js/` directory
- Include them in the HTML files
- Update the project plan in `PROJECT_PLAN.md`

## Performance

- **Initial Load**: ~100KB of JavaScript and CSS
- **Data Size**: ~500KB JSON file (loads once, cached by browser)
- **Search**: Client-side search with debouncing for performance
- **Images**: No external images, uses CSS for styling

## Contributing

This is a simple static site. To contribute:
1. Make changes to the HTML, CSS, or JavaScript files
2. Test locally by opening `index.html` in a browser
3. Commit and push changes
4. Deploy via your hosting platform

## Third-Party Libraries & Licensing

This project uses the following third-party libraries:

### Bootstrap 5
- **Version**: 5.3.0
- **License**: MIT License
- **Source**: Downloaded locally from [jsDelivr CDN](https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/)
- **Local Files**:
  - `css/bootstrap.min.css` (227KB)
  - `js/bootstrap.bundle.min.js` (80KB)

**Licensing Details**: Bootstrap is released under the MIT License, which allows free use, modification, and distribution. The MIT License is permissive and compatible with most open-source and commercial projects.

### Why Local Files Instead of CDN?

While CDN links are convenient for development, this project uses local copies for:

1. **Content Control**: You know exactly what's in the files
2. **Offline Development**: Works without internet connection
3. **Deployment Reliability**: No dependency on external services
4. **Version Pinning**: Exact version control in your repository
5. **Performance**: Potentially faster loading from same domain

### Updating Bootstrap

To update to a newer version of Bootstrap:

```bash
# Download latest CSS
curl -o css/bootstrap.min.css https://cdn.jsdelivr.net/npm/bootstrap@5.3.x/dist/css/bootstrap.min.css

# Download latest JS
curl -o js/bootstrap.bundle.min.js https://cdn.jsdelivr.net/npm/bootstrap@5.3.x/dist/js/bootstrap.bundle.min.js

# Test the application
# Commit changes
```

## License

Built for the improv community. Feel free to use and modify as needed.

## Contact

For questions about the MUT Improv Games database, contact the maintainers. For technical questions about this web application, check the code comments or create an issue in the repository.

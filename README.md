# MUT Improv Games Web Application

A responsive web application for browsing and searching the MUT Improv Games database. Built with HTML, CSS, and JavaScript, hosted for free on Render.com.

## Features

- **Search**: Real-time text search across game names, descriptions, rules, tips, and examples
- **Filters**: Filter by category, difficulty level, and other attributes
- **Game Details**: Click any game to view comprehensive information including setup, rules, tips, examples, and video links
- **YouTube Integration**: Embedded YouTube videos for games that have video examples
- **Responsive Design**: Mobile-friendly interface using Bootstrap 5
- **Fast & Static**: No backend required, all logic runs client-side

## Project Structure

```
mutgames-web/
├── index.html          # Main page with game listing and search
├── game.html           # Individual game details page
├── css/
│   ├── style.css       # Custom styles
│   └── bootstrap.min.css # Bootstrap 5 (CDN recommended)
├── js/
│   ├── app.js          # Main application initialization
│   ├── data.js         # Data loading and processing
│   ├── search.js       # Search and filter functionality
│   └── game-details.js # Game details page logic
├── data/
│   └── mutgames.json   # Game database (copied from parent directory)
└── README.md           # This file
```

## Setup & Development

1. **Clone or copy the project structure**
2. **Copy the game data**: Ensure `mutgames.json` is in the `data/` directory
3. **Open in browser**: Simply open `index.html` in any modern web browser
4. **No build process required**: This is a static site with no dependencies

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

## License

Built for the improv community. Feel free to use and modify as needed.

## Contact

For questions about the MUT Improv Games database, contact the maintainers. For technical questions about this web application, check the code comments or create an issue in the repository.

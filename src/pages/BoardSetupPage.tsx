import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Search, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const FAMOUS_PEOPLE_SUGGESTIONS = [
  'Taylor Swift',
  'Cristiano Ronaldo',
  'Lionel Messi',
  'Elon Musk',
  'Selena Gomez',
  'Dwayne Johnson',
  'Virat Kohli',
  'Billie Eilish',
  'Shah Rukh Khan',
  'Zendaya',
  'Tom Holland',
  'Beyonce',
];

const SETUP_SUGGESTIONS = [
  'Aim for at least 8 to 12 characters so the guessing phase lasts longer.',
  'Mix obvious visual traits like glasses, hats, facial hair, and hairstyles.',
  'Avoid adding multiple characters that look too similar unless you want a harder game.',
  'Use well-known people so both players can recognize them quickly.',
];

const BoardSetupPage = () => {

  const { room, playerId, addCharacter, removeCharacter, finishSetup } = useSocket();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [searching, setSearching] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  const isHost = room?.players.find(p => p.id === playerId)?.isHost ?? false;
  const characterCount = room?.characters.length ?? 0;
  const existingCharacterNames = new Set(
    room?.characters.map(character => character.name.toLowerCase()) ?? []
  );
  const progressSuggestion =
    characterCount < 4
      ? 'You need at least 4 characters before the board can continue.'
      : characterCount < 8
        ? 'The board is playable now, but adding a few more characters will make guessing better.'
        : 'The board size looks solid. Focus on keeping the cast visually diverse.';
  const filteredSuggestions = FAMOUS_PEOPLE_SUGGESTIONS.filter((person) => {
    const matchesQuery =
      !name.trim() || person.toLowerCase().includes(name.trim().toLowerCase());
    return matchesQuery && !existingCharacterNames.has(person.toLowerCase());
  }).slice(0, 6);

  useEffect(() => {

    if (!room) {
      navigate('/');
      return;
    }

    if (room.phase === 'character-selection') navigate('/select');
    if (room.phase === 'playing') navigate('/game');

  }, [room, navigate]);

  // ==========================
  // Fetch image from Wikipedia
  // ==========================
  const fetchCelebrityImage = async (query: string) => {

    if (!query.trim()) return;

    setSearching(true);

    try {

      const res = await fetch(
        `${WIKI_API}?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=300&origin=*`
      );

      const data = await res.json();

      const pages = data.query?.pages;

      const page = pages ? Object.values(pages)[0] as any : null;

      if (page?.thumbnail?.source) {

        setImageUrl(page.thumbnail.source);
        return page.thumbnail.source as string;

      } else {

        toast.info('No image found on Wikipedia.');
        return '';

      }

    } catch {

      toast.error('Failed to fetch image.');
      return '';

    } finally {

      setSearching(false);

    }

  };

  // ==========================
  // Auto-search when name typed
  // ==========================
  useEffect(() => {

    const delay = setTimeout(() => {

      if (name.trim()) {
        fetchCelebrityImage(name);
      }

    }, 600); // debounce

    return () => clearTimeout(delay);

  }, [name]);

  // ==========================
  // Add character
  // ==========================
  const handleAdd = () => {

    if (!name.trim()) return;

    const fallback =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;

    const finalImage = imageUrl.trim() || fallback;

    addCharacter(name.trim(), finalImage);

    setName('');
    setImageUrl('');
    setShowNameSuggestions(false);

  };

  const handleSuggestedCharacterAdd = async (suggestedName: string) => {

    if (existingCharacterNames.has(suggestedName.toLowerCase())) return;

    setName(suggestedName);
    setShowNameSuggestions(false);

    const fetchedImage = await fetchCelebrityImage(suggestedName);
    const fallback =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(suggestedName)}&background=random&size=200`;

    addCharacter(suggestedName, fetchedImage || fallback);
    setName('');
    setImageUrl('');

  };

  if (!room) return null;

  return (

    <div className="min-h-screen py-8" style={{ background: 'var(--gradient-surface)' }}>

      <div className="mx-auto max-w-4xl px-6">

        <div className="mb-6 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Board Setup
          </h2>
          <p className="mt-1 text-muted-foreground">
            Add characters to the game board ({characterCount} added)
          </p>
        </div>

        {isHost && (

          <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-3">

              {/* Character name */}
              <div className="relative">
                <div className="flex gap-2">

                  <Input
                    placeholder="Character name (e.g. Elon Musk)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setShowNameSuggestions(true)}
                    onBlur={() => {
                      window.setTimeout(() => setShowNameSuggestions(false), 120);
                    }}
                    className="h-10"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-3"
                    onClick={() => fetchCelebrityImage(name)}
                    disabled={!name || searching}
                  >
                    <Search className="h-4 w-4" />
                  </Button>

                </div>

                {showNameSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-12 top-[calc(100%+0.5rem)] z-10 rounded-2xl border border-border bg-card p-3 shadow-card">
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Famous people
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {filteredSuggestions.map((person) => (
                        <button
                          key={person}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => void handleSuggestedCharacterAdd(person)}
                          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {person}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Image URL */}
              <Input
                placeholder="Image URL (optional override)"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="h-10"
              />

              {/* Buttons */}
              <div className="flex gap-2">

                <Button
                  onClick={handleAdd}
                  disabled={!name.trim()}
                  className="gradient-primary text-primary-foreground"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Character
                </Button>

                {characterCount >= 4 && (

                  <Button
                    onClick={finishSetup}
                    variant="outline"
                    className="ml-auto"
                  >
                    Continue
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>

                )}

              </div>

            </div>

            <aside className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm font-semibold text-foreground">
                Host suggestions
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {progressSuggestion}
              </p>

              <div className="mt-4 space-y-2">
                {SETUP_SUGGESTIONS.map((suggestion) => (
                  <div
                    key={suggestion}
                    className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </aside>

          </div>

        )}

        {!isHost && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            The host is setting up the board...
          </p>
        )}

        {/* Character grid */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">

          {room.characters.map(c => (

            <div
              key={c.id}
              className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-card"
            >

              <img
                src={c.imageUrl}
                alt={c.name}
                className="aspect-square w-full object-cover"
              />

              <div className="p-2 text-center">
                <p className="text-xs font-medium text-foreground truncate">
                  {c.name}
                </p>
              </div>

              {isHost && (

                <button
                  onClick={() => removeCharacter(c.id)}
                  className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>

              )}

            </div>

          ))}

        </div>

      </div>

    </div>

  );

};

export default BoardSetupPage;

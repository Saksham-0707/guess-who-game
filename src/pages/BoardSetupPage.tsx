import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Plus, Search, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { CharacterTile } from '@/components/CharacterTile';
import { PageLoader } from '@/components/PageLoader';
import { PageShell } from '@/components/PageShell';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
  'Aim for 8 to 12 characters for longer rounds.',
  'Mix obvious traits like glasses, facial hair, hats, or hairstyles.',
  'Avoid adding too many near-identical faces unless you want a harder board.',
  'Well-known people keep the guessing phase faster and fairer.',
];

const BoardSetupPage = () => {
  const { room, playerId, addCharacter, removeCharacter, finishSetup } = useSocket();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [searching, setSearching] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  const isHost = room?.players.find((player) => player.id === playerId)?.isHost ?? false;
  const characterCount = room?.characters.length ?? 0;

  const existingCharacterNames = useMemo(
    () => new Set(room?.characters.map((character) => character.name.toLowerCase()) ?? []),
    [room?.characters],
  );

  const progressSuggestion =
    characterCount < 4
      ? 'Add at least four characters before continuing.'
      : characterCount < 8
        ? 'Playable already, but a few more characters will improve the deduction loop.'
        : 'Board size looks strong. Focus on visual variety now.';

  const filteredSuggestions = FAMOUS_PEOPLE_SUGGESTIONS.filter((person) => {
    const matchesQuery = !name.trim() || person.toLowerCase().includes(name.trim().toLowerCase());
    return matchesQuery && !existingCharacterNames.has(person.toLowerCase());
  }).slice(0, 8);

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }

    if (room.phase === 'character-selection') navigate('/select');
    if (room.phase === 'playing') navigate('/game');
  }, [navigate, room]);

  const fetchCelebrityImage = async (query: string) => {
    if (!query.trim()) return '';

    setSearching(true);

    try {
      const res = await fetch(
        `${WIKI_API}?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=300&origin=*`,
      );

      const data = await res.json();
      const pages = data.query?.pages;
      const page = pages ? (Object.values(pages)[0] as { thumbnail?: { source?: string } }) : null;

      if (page?.thumbnail?.source) {
        setImageUrl(page.thumbnail.source);
        return page.thumbnail.source;
      }

      toast.info('No image found on Wikipedia.');
      return '';
    } catch {
      toast.error('Failed to fetch image.');
      return '';
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const delay = window.setTimeout(() => {
      if (name.trim()) {
        void fetchCelebrityImage(name);
      }
    }, 600);

    return () => window.clearTimeout(delay);
  }, [name]);

  const handleAdd = () => {
    if (!name.trim()) return;

    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;
    addCharacter(name.trim(), imageUrl.trim() || fallback);
    setName('');
    setImageUrl('');
    setShowNameSuggestions(false);
  };

  const handleSuggestedCharacterAdd = async (suggestedName: string) => {
    if (existingCharacterNames.has(suggestedName.toLowerCase())) return;

    setName(suggestedName);
    setShowNameSuggestions(false);

    const fetchedImage = await fetchCelebrityImage(suggestedName);
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(suggestedName)}&background=random&size=200`;

    addCharacter(suggestedName, fetchedImage || fallback);
    setName('');
    setImageUrl('');
  };

  if (!room) return <PageLoader title="Loading board setup" description="Preparing the host workspace." />;

  return (
    <PageShell
      eyebrow="Board Setup"
      title="Build a board that looks intentional and plays well."
      description="The host workspace combines direct add controls, curated famous-person shortcuts, and live setup guidance to reduce friction."
      roomCode={room.code}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Setup controls</CardTitle>
              <CardDescription>Add a name, fetch an image, or use a quick suggestion to populate the board.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {isHost ? (
                <>
                  <div className="relative space-y-3">
                    <label className="text-sm font-semibold text-foreground">Character name</label>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Type a famous person"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        onFocus={() => setShowNameSuggestions(true)}
                        onBlur={() => {
                          window.setTimeout(() => setShowNameSuggestions(false), 120);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => void fetchCelebrityImage(name)}
                        disabled={!name || searching}
                        aria-label="Search image"
                      >
                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>

                    {showNameSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 rounded-[24px] border border-border/70 bg-card/92 p-4 shadow-card backdrop-blur-xl">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                          Famous people
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {filteredSuggestions.map((person) => (
                            <button
                              key={person}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => void handleSuggestedCharacterAdd(person)}
                              className="rounded-full border border-border/70 bg-background/75 px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-secondary"
                            >
                              {person}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Image override</label>
                    <Input
                      placeholder="Paste an image URL if you want to override the search result"
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button onClick={handleAdd} disabled={!name.trim()} className="gradient-primary text-primary-foreground sm:flex-1">
                      <Plus className="h-4 w-4" />
                      Add character
                    </Button>

                    {characterCount >= 4 && (
                      <Button onClick={finishSetup} variant="outline" className="sm:flex-1">
                        Continue to selection
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-[24px] border border-border/60 bg-secondary/60 px-4 py-4 text-sm text-muted-foreground">
                  The host is building the board. You will move to character selection automatically when setup is finished.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.06 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Sparkles className="h-6 w-6 text-primary" />
                Host suggestions
              </CardTitle>
              <CardDescription>{progressSuggestion}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SETUP_SUGGESTIONS.map((suggestion) => (
                <div key={suggestion} className="rounded-[22px] border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  {suggestion}
                </div>
              ))}
              <div className="rounded-[22px] border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-foreground">
                Current board size: <span className="font-semibold">{characterCount}</span> characters
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Live board</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
              Character grid
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {room.characters.map((character) => (
            <CharacterTile
              key={character.id}
              id={character.id}
              name={character.name}
              imageUrl={character.imageUrl}
              onClick={isHost ? removeCharacter : undefined}
              badge={isHost ? 'Remove' : undefined}
              footer={
                isHost ? (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tap to remove</span>
                    <X className="h-3.5 w-3.5" />
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      </motion.section>
    </PageShell>
  );
};

export default BoardSetupPage;

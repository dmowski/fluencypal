import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { Box, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { JSX } from 'react';

export const PhrasesArticles = ({ lang }: { lang: SupportedLanguage }): JSX.Element => {
  const i18n = getI18nInstance(lang);

  return (
    <Stack
      sx={{
        '--mui-palette-text-secondary': '#222',
      }}
    >
      <Typography>
        {i18n._(`At the end, we’ll share a valuable tool for realistic interview practice.`)}
      </Typography>

      <Stack sx={{ py: 2 }}>
        <Typography variant="h2">
          {i18n._('Introduction: Small Talk with the Interviewer')}
        </Typography>

        <Typography>
          {i18n._(
            "The first few minutes of an interview are often dedicated to casual conversation — also known as 'SmallTalk'. Recruiters use this time to create a friendly atmosphere and get to know you a bit better.",
          )}
        </Typography>

        <Typography
          sx={{
            pt: 2,
          }}
        >
          <strong>{i18n._('Don’t skip small talk')}</strong>{' '}
          {i18n._(
            '— it’s important to engage in this short conversation before jumping into professional topics. Here are some useful English phrases to start off the interview:',
          )}
        </Typography>
      </Stack>

      <Box sx={{ py: 2 }}>
        <Typography variant="h2">{i18n._('English Phrases')}</Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Hello! Nice to meet you."
              secondary={i18n._('A polite and professional greeting.')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Thank you for having me."
              secondary={i18n._('Expressing gratitude for the opportunity.')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="I’m doing well, thank you."
              secondary={i18n._('A standard reply to “How are you?”')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="It’s a lovely office (here)."
              secondary={i18n._('A friendly compliment to break the ice.')}
            />
          </ListItem>
        </List>
      </Box>

      <Box>
        <Typography>
          {i18n._(
            'Smile, shake hands (if culturally appropriate), and speak in a friendly tone. If the interviewer asks, “Did you have any trouble finding us?” you might say:',
          )}
        </Typography>
        <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
          “Not at all, the directions were clear. Thank you for asking.”
        </Typography>
        <Typography>
          {i18n._(
            'Short answers with a positive attitude show that you’re easy to talk to and open to dialogue.',
          )}
        </Typography>
      </Box>

      <Box sx={{ py: 2 }}>
        <Typography variant="h2" gutterBottom>
          {i18n._('Self-Introduction: Talking About Yourself')}
        </Typography>

        <Typography>
          {i18n._("After the greeting, you'll usually hear:")} “Tell me about yourself.”{' '}
          {i18n._(
            'This is your chance to introduce your experience and skills. Don’t list your full biography — focus on the highlights of your professional background. A good answer structure in English might look like this:',
          )}
        </Typography>

        <Box sx={{ borderLeft: '4px solid', pl: 2, my: 2 }}>
          <Typography variant="body1" fontWeight="bold">
            “Sure. I am a [position] with X years of experience in [industry]. I previously worked
            at [company] where I [key achievement]. I’m excited about this opportunity at [Company
            Name] because [reason].”
          </Typography>
        </Box>

        <Typography>{i18n._('For example:')}</Typography>

        <Typography
          sx={{
            fontSize: '1.6rem',
            fontWeight: 300,
            border: '1px solid #ccc',
            padding: '25px 30px',
            borderRadius: '15px',
            margin: '20px 0',
            backgroundColor: '#f9f9ff',
          }}
        >
          “I am a marketing specialist with 5 years of experience in digital advertising. I
          previously worked at an e-commerce company where I led a project that increased sales by
          30%. I’m excited about this opportunity at ABC Corp because I admire your innovative
          campaigns.”
        </Typography>

        <Typography>
          {i18n._(
            'Keep your answer focused: current or last position, a key achievement, and your interest in the company. Practice your self-introduction so you sound ',
          )}
          <strong>{i18n._('natural and not robotic')}</strong>.
        </Typography>
      </Box>

      <Box sx={{ py: 2 }}>
        <Typography variant="h2" gutterBottom>
          {i18n._('Useful Phrases for Self-Introduction')}
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="I have X years of experience in…" />
          </ListItem>
          <ListItem>
            <ListItemText primary="My background is in…" />
          </ListItem>
          <ListItem>
            <ListItemText primary="I specialize in…" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Currently, I work as a…" />
          </ListItem>
        </List>

        <Typography>
          {i18n._(
            'Use these templates to craft your own story. Don’t forget to mention an achievement:',
          )}
        </Typography>
        <Typography paragraph fontWeight="bold">
          “I managed to…” – {i18n._('This shows results and makes you stand out.')}
        </Typography>

        <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
          {i18n._('Answering Typical Interview Questions')}
        </Typography>

        <Typography>
          {i18n._(
            'Recruiters ask a variety of standard questions to understand your motivation and personality. Preparing answers in advance will help you stay calm and articulate. Focus on showing enthusiasm and confidence in your skills. Let’s look at some common questions and how to answer them:',
          )}
        </Typography>

        <Typography
          fontWeight="bold"
          sx={{
            pt: '20px',
          }}
        >
          “Why do you want to work here?”
        </Typography>
        <Typography>
          {i18n._('Show knowledge of the company and genuine interest. For example:')}
          <br />
          <strong>
            “I’m impressed by your company’s mission and values. I want to be part of a team that
            [does something meaningful in the field].”
          </strong>
        </Typography>

        <Typography
          fontWeight="bold"
          sx={{
            pt: '20px',
          }}
        >
          “Why should we hire you?”
        </Typography>
        <Typography>
          {i18n._('Highlight your strengths relevant to the role:')}
          <br />
          <strong>
            “I have a proven track record in [skill/area]. For example, in my last role I
            [achievement]. I’m confident I can bring the same success here.”
          </strong>
        </Typography>

        <Typography
          fontWeight="bold"
          sx={{
            pt: '20px',
          }}
        >
          “Where do you see yourself in five years?”
        </Typography>
        <Typography>
          {i18n._('Show your long-term goals:')}
          <br />
          <strong>
            “In five years, I see myself growing into a senior role where I can lead projects and
            contribute even more to the company’s success.”
          </strong>
        </Typography>

        <Typography
          sx={{
            pt: '20px',
          }}
        >
          {i18n._('Other common questions include:')} <br />
          “What motivates you?”, “Tell me about a challenge you overcame.”, “What are your salary
          expectations?”{' '}
          {i18n._('Prepare short, honest, and positive answers with real-life examples.')}
        </Typography>

        <Typography>
          {i18n._('If you don’t understand a question, don’t panic — ask politely:')}
          <br />
          <strong>“I’m sorry, could you repeat or rephrase the question, please?”</strong>
        </Typography>
      </Box>

      <Box sx={{ py: 2 }}>
        <Typography variant="h2" gutterBottom>
          {i18n._('Talking About Strengths and Weaknesses')}
        </Typography>

        <Typography>
          {i18n._(
            'Most interviews include the classic “strengths and weaknesses” question. It’s especially important to handle this well in English.',
          )}
        </Typography>

        <Typography
          fontWeight="bold"
          sx={{
            pt: '20px',
          }}
        >
          {i18n._('Strengths:')}
        </Typography>
        <Typography>
          {i18n._(
            'Pick 2–3 key qualities relevant to the job. Avoid clichés and provide examples. For instance:',
          )}
          <br />
          <strong>
            “One of my strengths is adaptability. I quickly adjust to new software or processes – at
            my last job I learned a new CRM system in just two weeks.”
          </strong>
        </Typography>
        <Typography>
          {i18n._('Other useful strengths:')} team player, detail-oriented, problem-solver,
          self-motivated.
        </Typography>

        <Typography
          fontWeight="bold"
          sx={{
            pt: '20px',
          }}
        >
          {i18n._('Weaknesses:')}
        </Typography>
        <Typography>
          {i18n._(
            'Be honest but diplomatic. Don’t say “I have no weaknesses.” Instead, mention a minor issue and how you’re working to improve it:',
          )}
          <br />
          <strong>
            “I used to feel nervous speaking in front of large groups, but I’ve been taking public
            speaking classes to improve. It’s getting much easier for me.”
          </strong>
        </Typography>
        <Typography>
          <strong>
            “One area I’m working on is delegating tasks – sometimes I try to do everything myself.
            I’m learning to trust my team members more.”
          </strong>
        </Typography>

        <Typography>{i18n._('This approach shows self-awareness and growth.')}</Typography>

        <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
          {i18n._('Questions to Ask the Employer')}
        </Typography>

        <Typography>
          {i18n._('At the end of the interview, you’ll usually be asked:')} *“Do you have any
          questions for us?”* {i18n._('Never say “no.” Prepare 2–3 smart questions in advance:')}
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="What are the prospects for growth and advancement in this company?" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Could you describe the team I’ll be working with?" />
          </ListItem>
          <ListItem>
            <ListItemText primary="What are the immediate goals for this role in the first few months?" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Will there be opportunities for training or professional development?" />
          </ListItem>
        </List>

        <Typography>
          {i18n._('Always respond politely:')} <br />
          <strong>“Could you tell me…”</strong>, <strong>“Would it be possible to…”</strong>
        </Typography>
        <Typography>
          {i18n._('Show curiosity and engagement. Don’t forget to thank them for their answers:')}
          <br />
          <strong>“Thank you for clarifying.”</strong>
        </Typography>
      </Box>

      <Box sx={{ py: 2 }}>
        <Typography variant="h2" gutterBottom>
          {i18n._('Ending the Interview: Final Phrases')}
        </Typography>

        <Typography>
          {i18n._(
            'Wrap up the interview with gratitude and confidence. Use these phrases to end on a positive note:',
          )}
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="Thank you for your time. It was a pleasure meeting you." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Thank you for this opportunity. I enjoyed our conversation." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Have a great rest of your day!" />
          </ListItem>
          <ListItem>
            <ListItemText primary="I look forward to hearing from you soon." />
          </ListItem>
        </List>

        <Typography>
          {i18n._(
            'If it was an in-person interview, shake hands and maintain eye contact. If it was online, say goodbye with a friendly tone. Consider sending a thank-you email the next day:',
          )}
          <br />
          <strong>
            “Thank you once again for the interview yesterday – I appreciated the chance to learn
            more about [Company].”
          </strong>
        </Typography>

        <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
          {i18n._('Common Mistakes to Avoid')}
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary={i18n._(
                'Skipping small talk — Follow the interviewer’s lead and be friendly.',
              )}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={i18n._(
                'Saying “I don’t know” directly — Instead say: “That’s an interesting question. Let me think for a moment.”',
              )}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={i18n._(
                'Lack of politeness — Use *please*, *thank you*, *excuse me* as needed.',
              )}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={i18n._(
                'Over-rehearsed answers — Don’t memorize; prepare ideas and speak naturally.',
              )}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={i18n._(
                'Negative comments — Never badmouth past employers. Stay neutral and constructive.',
              )}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={i18n._(
                'Showing no interest — Ask questions and react positively to company information.',
              )}
            />
          </ListItem>
        </List>

        <Typography>
          {i18n._(
            'Avoiding these mistakes will make you look more professional and increase your chances of success.',
          )}
        </Typography>

        <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
          {i18n._('Practice Interviews on FluencyPal: Your Path to Confidence')}
        </Typography>

        <Typography>
          {i18n._(
            'Knowing useful phrases and tips is great, but the most important step is real-world practice. The best way to prepare is to do a mock interview. That’s exactly what the interactive role-play on FluencyPal offers.',
          )}
        </Typography>

        <Typography>
          {i18n._(
            'On this platform, you can upload your resume, specify your desired job, and go through a realistic interview with an AI interviewer.',
          )}
        </Typography>

        <Typography
          sx={{
            pt: '20px',
          }}
        >
          <strong>{i18n._('How it Works:')}</strong>{' '}
          {i18n._(
            'You answer questions just like in a real interview and get instant feedback. The AI adapts the questions to your profession and experience. This kind of training helps you identify weak spots, work on your pronunciation, and learn how to handle unexpected questions calmly. You’ll notice your speech becoming more fluent and your answers more polished with each attempt.',
          )}
        </Typography>

        <Typography
          sx={{
            pt: '20px',
          }}
        >
          <strong>{i18n._('Career benefit:')}</strong>{' '}
          {i18n._(
            'After several sessions, you’ll walk into your real interview much more confident. You’ll know what phrases to use, how to present yourself, and how to respond professionally. It can significantly boost your chances of landing your dream job.',
          )}
        </Typography>

        <Typography
          sx={{
            pt: '20px',
          }}
        >
          {i18n._(
            'Preparing for an interview in English takes time, but it pays off. Use the tips from this article, practice with FluencyPal’s interview simulator, and walk into your next job interview with confidence.',
          )}
          <br />
          <strong>{i18n._('Good preparation today means career success tomorrow.')}</strong>
        </Typography>
      </Box>
    </Stack>
  );
};
